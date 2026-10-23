# Backlog del Desarrollador A — 56 h

Estado al 23/10/2026. "Implementado" significa código + tests locales; "Verificado" suma la evidencia que pide el
plan para esa tarea, en entorno local. La aceptación final requiere además la validación cloud de V1–V4.

| ID | Tarea | h | Estado | Dónde | Evidencia / falta para aceptar |
|---|---|---|---|---|---|
| A01 | Contratos comunes: identidad, errores, cliente HTTP, consumo de shared | 3 | Implementado | `packages/shared`, `apps/frontend/src/lib/api.ts`, `docs/contracts.md` | Falta: revisión de B y C |
| A02 | App Express testeable, entorno validado, CORS, errores uniformes, `listen` separado | 5 | Verificado | `apps/backend/src/app.ts`, `server.ts`, `config/env.ts`, `middleware/common.ts` | Tests unitarios de preflight, errores sin stack y `/ready`; smoke del build compilado |
| A03 | Login/logout y contexto autenticado en API | 7 | Verificado | `middleware/auth.ts`, `AuthProvider.tsx`, `/login` | Login real contra Supabase local; E2E cubre login inválido, ruta protegida y logout |
| A04 | Onboarding transaccional + configuración del negocio | 6 | Verificado | `modules/identity`, `/onboarding`, `/settings` | Test de integración con 5 onboardings concurrentes → un único negocio. Zona horaria detectada automáticamente |
| A05 | Clientes: endpoints, búsqueda, listado, formularios | 6 | Verificado | `modules/customers`, `/customers`, `CustomerFormDialog.tsx` | E2E: alta, validación, recarga y edición persistentes |
| A06 | Integración de Auth, permisos y acceso entre tenants | 4 | Verificado en local | `test/integration/tenant-isolation.test.ts` | 5/5 contra PostgreSQL real (21/10). Falta: correr en CI con Supabase local (B02) |
| A07 | Frontend con deploy manual (Vercel Hobby o Azure) | 6 | Preparado | `.github/workflows/frontend-deploy.yml`, `next.config.ts` | Proyecto Vercel `turnosmart` (Hobby, `turnosmart-eight.vercel.app`) creado el 23/10: sin Git conectado, sin deployments, Root Directory `apps/frontend` con archivos externos habilitados. `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SUPABASE_URL` y `SUPABASE_ANON_KEY` cargados en GitHub Actions. Falta: confirmar destino con B y deploy en V1 el 29/10 |
| A08 | Adaptador Gemini, endpoint y panel de explicación | 6 | Verificado en local | `modules/ai`, `RiskExplanationPanel.tsx` | Llamada real a `gemini-3.5-flash-lite` con clave Free; tono corregido. Falta: score real de C (C08) y prueba en V2 |
| A09 | E2E del recorrido crítico | 4 | Verificado en local | `apps/frontend/e2e` | 3/3 pasan sin mocks (21/10). Falta: sumar reservar, reprogramar y cancelar cuando estén B03–B05/C03–C06 |
| A10 | Arquitectura, AI-DECISIONS, matriz de requisitos, consulta docente | 3 | En curso | `docs/architecture.md`, `docs/AI-DECISIONS.md` | AI-DECISIONS con revisión humana registrada. Falta: enviar la consulta docente y registrar la respuesta |
| A11 | Créditos, cuotas, presupuesto y ledger de costos | 3 | En curso | `docs/costs.md` | Cuenta relevada el 23/10 (USD 98,79, vence 10/04/2027, sin medio de pago). Falta: crear budget USD 2, minutos de Actions, decisión de Vercel |
| C07 | Historial de eventos (lectura + UI) | 3 | Implementado | `modules/events`, `EventHistory.tsx` | Probado con eventos de prueba. Falta: eventos reales escritos por C (C03/C05/C06) |

## Integraciones pendientes con el equipo

- **C**: persistir `RiskScore.factors` como `RiskFactor[]` (`{code, label, impact, value?}`); enlazar la agenda a `/appointments/[id]`
  y sumar ahí los datos del turno, el score y las acciones de estado.
- **B**: si el repo del equipo ya tiene `schema.prisma` y migraciones, son la fuente de verdad: reemplazar
  `apps/backend/prisma` por las existentes y ajustar nombres de campo en los repositorios de A si difieren.
  B10 restringe escrituras directas; B02 agrega Supabase local a CI para `test:integration`.
- **B (A07/A11)**: destino del frontend. Recomendación de A: Vercel Hobby con el repositorio público (gratis, sin
  consumir crédito ni un segundo Web App); Azure sólo si el repo debe ser privado.
- **Todo el equipo**: proyecto Supabase Free en la nube creado por A el 23/10 (URL y publishable key ya cargadas en GitHub
  Actions). A invita a B y C a la organización para que obtengan las cadenas de conexión (`DATABASE_URL`, `DIRECT_URL`).
  Migración inicial (`20261021000000_init`) aplicada por A el 23/10 con `prisma migrate deploy`; las migraciones
  nuevas se aplican en el deploy de cada ventana. El plan Free pausa el proyecto tras una semana sin uso:
  revisar y restaurar antes de cada ventana.
- **Todos**: ramas `feat/A0x-…` desde `dev`, PR revisada por B (B revisa A).

## Cómo correr la evidencia local

```bash
npm test                    # unitarias (36)
npm run test:integration    # API-DB real: requiere `npx supabase start` y migraciones
npm run test:e2e            # requiere servidores levantados y E2E_USER_EMAIL / E2E_USER_PASSWORD
```
