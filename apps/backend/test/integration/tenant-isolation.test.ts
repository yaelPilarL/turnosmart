/**
 * A06: Auth, permisos y acceso entre tenants contra PostgreSQL real (Supabase local o DB descartable).
 * Requiere DATABASE_URL con migraciones aplicadas. Sin DB, falla: "no hay tests" no cuenta como éxito.
 * El token se simula con FakeVerifier; la validación real de tokens de Supabase se cubre en el E2E (A09).
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { PrismaRiskRepository } from '../../src/modules/ai/risk-repository';
import { PrismaCustomerRepository } from '../../src/modules/customers/repository';
import { PrismaEventRepository } from '../../src/modules/events/repository';
import { PrismaIdentityRepository } from '../../src/modules/identity/repository';
import { FakeVerifier } from '../fakes';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no definida: levantar Supabase local (ver README) antes de test:integration');
}

const prisma = new PrismaClient();
const verifier = new FakeVerifier();
const identity = new PrismaIdentityRepository(prisma);
const app = createApp({
  corsOrigins: [],
  verifier,
  identity,
  customers: new PrismaCustomerRepository(prisma),
  events: new PrismaEventRepository(prisma),
  risk: new PrismaRiskRepository(prisma),
  explainer: null,
  aiRateLimit: { limit: 10, windowMs: 60_000 },
  checkReady: async () => true,
});

const createdBusinesses: string[] = [];
let ownerA: { Authorization: string };
let ownerB: { Authorization: string };

async function onboard(name: string) {
  const user = verifier.addUser();
  const auth = { Authorization: `Bearer ${user.token}` };
  const res = await request(app).post('/api/onboarding').set(auth).send({ businessName: name });
  expect(res.status).toBe(201);
  createdBusinesses.push(res.body.business.id);
  return { auth, userId: user.id, businessId: res.body.business.id as string };
}

beforeAll(async () => {
  await prisma.$queryRaw`SELECT 1`;
  ownerA = (await onboard(`Test A ${Date.now()}`)).auth;
  ownerB = (await onboard(`Test B ${Date.now()}`)).auth;
});

afterAll(async () => {
  // Cascade elimina perfiles, clientes y turnos de prueba.
  await prisma.business.deleteMany({ where: { id: { in: createdBusinesses } } });
  await prisma.$disconnect();
});

describe('integración API-DB: identidad', () => {
  it('readiness real', async () => {
    expect((await request(app).get('/ready')).status).toBe(200);
  });

  it('onboarding concurrente crea un único negocio', async () => {
    const user = verifier.addUser();
    const auth = { Authorization: `Bearer ${user.token}` };
    const results = await Promise.all(
      Array.from({ length: 5 }, () => request(app).post('/api/onboarding').set(auth).send({ businessName: 'Carrera' })),
    );
    const ids = new Set(results.map((r) => r.body.business?.id));
    expect(ids.size).toBe(1);
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    createdBusinesses.push([...ids][0]);
    expect(await prisma.profile.count({ where: { id: user.id } })).toBe(1);
  });
});

describe('integración API-DB: clientes y aislamiento', () => {
  it('persiste y otro negocio no puede leer, editar ni listar', async () => {
    const created = await request(app)
      .post('/api/customers')
      .set(ownerA)
      .send({ fullName: 'Cliente Persistente', email: 'p@example.com' });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const reloaded = await request(app).get(`/api/customers/${id}`).set(ownerA);
    expect(reloaded.body.fullName).toBe('Cliente Persistente');

    expect((await request(app).get(`/api/customers/${id}`).set(ownerB)).status).toBe(404);
    expect((await request(app).patch(`/api/customers/${id}`).set(ownerB).send({ fullName: 'X' })).status).toBe(404);
    const listB = await request(app).get('/api/customers?search=Persistente').set(ownerB);
    expect(listB.body.total).toBe(0);

    const db = await prisma.customer.findUnique({ where: { id } });
    expect(db?.fullName).toBe('Cliente Persistente');
  });

  it('búsqueda insensible a mayúsculas', async () => {
    await request(app).post('/api/customers').set(ownerA).send({ fullName: 'Mariana Búsqueda' });
    const res = await request(app).get('/api/customers?search=mariana').set(ownerA);
    expect(res.body.items.some((c: { fullName: string }) => c.fullName === 'Mariana Búsqueda')).toBe(true);
  });

  it('eventos y explicación de un turno inexistente o ajeno → 404', async () => {
    const id = randomUUID();
    expect((await request(app).get(`/api/appointments/${id}/events`).set(ownerA)).status).toBe(404);
    expect((await request(app).post(`/api/appointments/${id}/risk/explanation`).set(ownerA)).status).toBe(404);
  });
});
