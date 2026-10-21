import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildTestApp } from '../fakes';

describe('clientes (A05)', () => {
  let ctx: ReturnType<typeof buildTestApp>;
  let authA: { Authorization: string };
  let authB: { Authorization: string };

  beforeEach(() => {
    ctx = buildTestApp();
    const a = ctx.verifier.addUser();
    const b = ctx.verifier.addUser();
    ctx.identity.addMember(a.id, randomUUID(), 'STAFF');
    ctx.identity.addMember(b.id, randomUUID(), 'OWNER');
    authA = { Authorization: `Bearer ${a.token}` };
    authB = { Authorization: `Bearer ${b.token}` };
  });

  it('alta, consulta, edición y listado', async () => {
    const created = await request(ctx.app)
      .post('/api/customers')
      .set(authA)
      .send({ fullName: '  Ana Pérez ', email: 'ana@example.com', phone: '' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ fullName: 'Ana Pérez', email: 'ana@example.com', phone: null });

    const id = created.body.id;
    const patched = await request(ctx.app).patch(`/api/customers/${id}`).set(authA).send({ phone: '221 555-1234' });
    expect(patched.status).toBe(200);
    expect(patched.body.phone).toBe('221 555-1234');
    expect(patched.body.fullName).toBe('Ana Pérez');

    const got = await request(ctx.app).get(`/api/customers/${id}`).set(authA);
    expect(got.body.phone).toBe('221 555-1234');

    const list = await request(ctx.app).get('/api/customers?search=ana').set(authA);
    expect(list.body).toMatchObject({ total: 1, page: 1, pageSize: 20 });
  });

  it('email opcional y no único', async () => {
    for (let i = 0; i < 2; i++) {
      const res = await request(ctx.app).post('/api/customers').set(authA).send({ fullName: `C${i}`, email: 'x@y.com' });
      expect(res.status).toBe(201);
    }
    const noEmail = await request(ctx.app).post('/api/customers').set(authA).send({ fullName: 'Sin email' });
    expect(noEmail.body.email).toBeNull();
  });

  it('valida nombre obligatorio y email', async () => {
    const res = await request(ctx.app).post('/api/customers').set(authA).send({ fullName: ' ', email: 'no-email' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('pageSize acotado', async () => {
    const res = await request(ctx.app).get('/api/customers?pageSize=500').set(authA);
    expect(res.status).toBe(422);
  });

  it('un negocio no ve ni edita clientes de otro (404)', async () => {
    const created = await request(ctx.app).post('/api/customers').set(authA).send({ fullName: 'Privado' });
    const id = created.body.id;

    expect((await request(ctx.app).get(`/api/customers/${id}`).set(authB)).status).toBe(404);
    expect((await request(ctx.app).patch(`/api/customers/${id}`).set(authB).send({ fullName: 'Hack' })).status).toBe(404);
    expect((await request(ctx.app).get('/api/customers').set(authB)).body.total).toBe(0);
    expect(ctx.customers.rows[0].fullName).toBe('Privado');
  });

  it('ignora businessId enviado en el body', async () => {
    const other = randomUUID();
    const res = await request(ctx.app).post('/api/customers').set(authA).send({ fullName: 'X', businessId: other });
    expect(res.status).toBe(201);
    expect(ctx.customers.rows[0].businessId).not.toBe(other);
  });

  it('id mal formado responde 404', async () => {
    const res = await request(ctx.app).get('/api/customers/123').set(authA);
    expect(res.status).toBe(404);
  });
});
