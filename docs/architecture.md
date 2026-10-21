# Arquitectura (A10)

## Vista general

```
Navegador (Next.js)
  ├── Supabase Auth SDK ──► Supabase Auth      (login, logout, refresh de sesión)
  └── fetch + Bearer ─────► API Express ──► Prisma ──► PostgreSQL (Supabase)
                                  └────► Gemini API (sólo factores agregados)
```

- El navegador usa Supabase **sólo** para autenticación. Toda operación de negocio pasa por Express.
- API sin estado: la sesión vive en el token; el único estado en memoria es el rate limit de IA (instancia única F1/B1).
- Backend modular (M1–M6) dentro de un único Express; los módulos son límites de responsabilidad, no microservicios.

## Seguridad multi-tenant

1. `authenticate` valida el token contra Supabase Auth (`auth.getUser`): cubre firma, vencimiento y usuarios eliminados.
2. `requireProfile` resuelve `businessId` y `role` desde `Profile` (`Profile.id = auth.users.id`).
3. `requirePermission` aplica la matriz de roles de `@turnosmart/shared`.
4. Cada repositorio recibe `businessId` como primer argumento; no existe consulta de tenant sin ese filtro.
5. Recursos de otro negocio responden 404, igual que los inexistentes, para no revelar su existencia.

Prisma se conecta como propietario y **omite RLS**: el aislamiento real lo da el filtro por negocio en la API, cubierto por
`test/unit/customers.test.ts` y `test/integration/tenant-isolation.test.ts`. RLS y la restricción de escrituras directas
vía la API de datos de Supabase son responsabilidad de B (B06/B10).

## Onboarding transaccional

`Business` + `Profile(OWNER)` se crean en una transacción. Ante requests concurrentes, la clave primaria de `Profile`
(= userId) hace fallar a todos menos uno con `P2002`; esas transacciones hacen rollback de su negocio y devuelven el
ganador. Resultado: un único negocio por cuenta, probado con 5 requests simultáneos.

## Integración con Gemini (A08)

- Adaptador detrás del puerto `LlmClient` (`modules/ai/llm.ts`), intercambiable y testeable con fakes.
- Sólo se envían `score`, `level` y factores `{code, label, impact, value}`; `sanitizeFactors` descarta cualquier otro campo.
  Nunca nombres, emails, teléfonos ni notas.
- Salida estructurada (`responseJsonSchema`) y validada con zod; un único reintento sólo si el formato es inválido.
- Timeout (`GEMINI_TIMEOUT_MS`), `maxOutputTokens` acotado, límite por usuario (`AI_RATE_LIMIT_*`).
- Gemini no modifica turnos ni decide estados. Si falla, la agenda y el score siguen operativos.
- La explicación es transitoria (no se persiste): no requiere cambios de schema. Persistirla/cachearla es P1.

## Frontend

- App Router; páginas de negocio como componentes cliente detrás de `(app)/layout.tsx`, que redirige a `/login` sin
  sesión y a `/onboarding` sin negocio.
- `lib/api.ts`: cliente HTTP único que adjunta el token vigente y normaliza errores del contrato (incluye `requestId`).
- Variables públicas: sólo `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`.
  La clave de Gemini y el service role nunca llegan al bundle.

## Deploy del frontend (A07)

Workflow manual [`frontend-deploy.yml`](../.github/workflows/frontend-deploy.yml) (`workflow_dispatch`, nunca por push):

| Destino | Cuándo | Cómo |
|---|---|---|
| Vercel Hobby | Sólo si A11 confirma elegibilidad del equipo/repo | `vercel build` + `deploy --prebuilt` |
| Azure Web App (F1, o mismo plan B1 que la API) | Si Hobby no aplica | `output: 'standalone'` + `node apps/frontend/server.js` |

`NEXT_PUBLIC_API_URL` se incrusta en build: si cambia la URL de la API en una ventana, hay que reconstruir el frontend.
Tras cada recreación: actualizar `CORS_ORIGINS` del backend y las URLs de redirección en Supabase Auth.

## Escalado y evolución

Sin estado en la API salvo el rate limit en memoria: con más de una réplica, moverlo a PostgreSQL. Datos fuera del
cómputo (Supabase), configuración externa por variables de entorno. F1 no tiene SLA ni representa producción.
