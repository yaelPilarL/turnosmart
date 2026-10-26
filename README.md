# TurnoSmart

SaaS multi-tenant de gestión de turnos con score de riesgo de ausencia y explicación con IA (Gemini).
UTN FRLP — Desarrollo de Software Cloud 2026. Checkpoint 2: **09/11/2026**.

Este repositorio contiene el alcance del **Desarrollador A** (autenticación, negocios, roles, clientes, IA, historial,
deploy del frontend, E2E y documentación). Los módulos de B (servicios, disponibilidad, slots, infraestructura Azure)
y C (agenda, reservas, eventos, score, observabilidad) se integran sobre los contratos de [`packages/shared`](packages/shared/src).

## Estructura

```
apps/
  backend/    Express 5 + Prisma 6 + Supabase Auth + Gemini   (puerto 4000)
  frontend/   Next.js 16 + React 19 + MUI 9                   (puerto 3000)
packages/
  shared/     Contratos comunes: DTOs, validaciones zod, errores, roles
docs/         Arquitectura, contratos, decisiones de IA, costos, backlog de A
```

## Requisitos

- Node 22 (`.nvmrc`). Node 24 funciona en local, pero CI usa 22: repetir los controles con 22 antes de comparar.
- Docker + [Supabase CLI](https://supabase.com/docs/guides/cli) para Auth y PostgreSQL locales.
- Clave de Gemini (opcional en local: sin clave, la explicación responde `503 AI_UNAVAILABLE` y el resto funciona).

## Puesta en marcha local

```bash
npm install
supabase start                # imprime API URL, anon key y DB URL
cp apps/backend/.env.example apps/backend/.env          # completar SUPABASE_ANON_KEY (y GEMINI_API_KEY si hay)
cp apps/frontend/.env.example apps/frontend/.env.local  # completar NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run prisma:migrate -w @turnosmart/backend           # aplica prisma/migrations a la DB local
npm run dev:backend           # http://localhost:4000/health
npm run dev:frontend          # http://localhost:3000
```

Las cuentas se provisionan desde Supabase Studio (`http://127.0.0.1:54323` → Authentication → Add user).
Al primer ingreso, una cuenta sin negocio pasa por el onboarding y queda como `OWNER`.

## Pruebas

| Comando | Qué cubre | Necesita |
|---|---|---|
| `npm test` | Unitarias + API con fakes: 401/403/404/422, onboarding, roles, aislamiento, CORS, errores, Gemini (timeout, cuota, respuesta inválida, límite) | Nada |
| `npm run test:integration` | API-Prisma-PostgreSQL real: persistencia, aislamiento entre dos negocios, onboarding concurrente | `DATABASE_URL` con migraciones |
| `npm run test:e2e` | Recorrido crítico en navegador sin mocks | Servidores levantados, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `npx playwright install chromium` |

Los comandos de integración y E2E **fallan** si falta su entorno: "no hay tests" nunca cuenta como éxito.

## APIs

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/health`, `/ready` | público |
| GET | `/api/me` | token válido |
| POST | `/api/onboarding` | token válido |
| PATCH | `/api/business` | OWNER, ADMIN |
| GET/POST | `/api/customers` | todos los roles |
| GET/PATCH | `/api/customers/:id` | todos los roles |
| GET | `/api/appointments/:id/events` | todos los roles |
| POST | `/api/appointments/:id/risk/explanation` | todos los roles |

Detalle de requests, respuestas y errores en [docs/contracts.md](docs/contracts.md).

## Documentación

- [docs/architecture.md](docs/architecture.md): arquitectura, seguridad multi-tenant y deploy.
- [docs/contracts.md](docs/contracts.md): contratos A01.
- [docs/AI-DECISIONS.md](docs/AI-DECISIONS.md): decisiones con IA y revisión humana.
- [docs/costs.md](docs/costs.md): registro de créditos y costos por ventana (A11).
- [docs/backlog-dev-a.md](docs/backlog-dev-a.md): estado de A01–A11 y C07.
