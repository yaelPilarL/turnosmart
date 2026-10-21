# Backlog del Desarrollador A — 56 h

Estado del andamiaje al 21/10/2026. "Implementado" significa código + tests locales; la aceptación del plan exige
además la evidencia indicada en cada fila.

| ID | Tarea | h | Estado | Dónde | Falta para aceptar |
|---|---|---|---|---|---|
| A01 | Contratos comunes: identidad, errores, cliente HTTP, consumo de shared | 3 | Implementado | `packages/shared`, `apps/frontend/src/lib/api.ts`, `docs/contracts.md` | Revisión de B y C |
| A02 | App Express testeable, entorno validado, CORS, errores uniformes, `listen` separado | 5 | Implementado | `apps/backend/src/app.ts`, `server.ts`, `config/env.ts`, `middleware/common.ts` | — |
| A03 | Login/logout y contexto autenticado en API | 7 | Implementado | `middleware/auth.ts`, `AuthProvider.tsx`, `/login` | Probar con Supabase local |
| A04 | Onboarding transaccional + configuración del negocio | 6 | Implementado | `modules/identity`, `/onboarding`, `/settings` | Correr test de concurrencia con DB |
| A05 | Clientes: endpoints, búsqueda, listado, formularios | 6 | Implementado | `modules/customers`, `/customers`, `CustomerFormDialog.tsx` | — |
| A06 | Integración de Auth, permisos y acceso entre tenants | 4 | Implementado | `test/integration/tenant-isolation.test.ts` | Ejecutar en CI con Supabase local (B02) |
| A07 | Frontend con deploy manual (Vercel Hobby o Azure) | 6 | Preparado | `.github/workflows/frontend-deploy.yml`, `next.config.ts` | A11 confirma destino; V1 el 29/10 |
| A08 | Adaptador Gemini, endpoint y panel de explicación | 6 | Implementado | `modules/ai`, `RiskExplanationPanel.tsx` | Llamada real con clave; integrar score de C (C08) |
| A09 | E2E del recorrido crítico | 4 | Implementado | `apps/frontend/e2e` | Ejecutar con cuenta de prueba; sumar reservas cuando estén B03–B05/C03–C06 |
| A10 | Arquitectura, AI-DECISIONS, matriz de requisitos, consulta docente | 3 | Borrador | `docs/architecture.md`, `docs/AI-DECISIONS.md` | Respuesta docente antes del 23/10; completar revisión humana |
| A11 | Créditos, cuotas, presupuesto y ledger de costos | 3 | Plantilla | `docs/costs.md` | Relevar la cuenta real antes del 23/10 |
| C07 | Historial de eventos (lectura + UI) | 3 | Implementado | `modules/events`, `EventHistory.tsx` | Eventos reales escritos por C (C03/C05/C06) |

## Integraciones pendientes con el equipo

- **C**: persistir `RiskScore.factors` como `RiskFactor[]` (`{code, label, impact, value?}`); enlazar la agenda a `/appointments/[id]`
  y sumar ahí los datos del turno, el score y las acciones de estado.
- **B**: si el repo del equipo ya tiene `schema.prisma` y migraciones, son la fuente de verdad: reemplazar
  `apps/backend/prisma` por las existentes y ajustar nombres de campo en los repositorios de A si difieren.
  B10 restringe escrituras directas; B02 agrega Supabase local a CI para `test:integration`.
- **Todos**: ramas `feat/A0x-…` desde `dev`, PR revisada por B (B revisa A).
