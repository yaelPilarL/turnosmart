# Decisiones asistidas por IA

Registro exigido por el TPI (p. 2): qué se generó o propuso con IA, qué alternativas se evaluaron, cómo se validó y
qué corrigió una persona. Cada entrada se vincula con su PR.

| Fecha | Tarea | Decisión | Alternativas | Validación | Revisión humana | PR |
|---|---|---|---|---|---|---|
| 21/10/2026 | A01–A08, C07 | Andamiaje inicial del alcance de A generado con Claude Code a partir del plan del Checkpoint 2 | — | `npm test` (36 casos), typecheck y build | _Pendiente: revisar y completar_ | _#_ |
| 21/10/2026 | A03 | Validar tokens con `supabase.auth.getUser` | Verificar JWT localmente con JWKS (menos latencia, no detecta usuarios eliminados) | Tests 401 con fakes; E2E con token real | _Pendiente_ | _#_ |
| 21/10/2026 | A04 | Idempotencia del onboarding vía PK de `Profile` + captura de `P2002` | Lock de fila / `SELECT … FOR UPDATE` | Test de integración con 5 requests concurrentes | _Pendiente_ | _#_ |
| 21/10/2026 | A08 | Salida estructurada JSON + zod, un reintento sólo por formato inválido | Texto libre; reintentos con backoff | Tests de timeout, cuota, respuesta inválida y límite | _Pendiente_ | _#_ |
| 21/10/2026 | A08 | Sólo factores agregados al prompt (`sanitizeFactors`) | Enviar contexto del turno | Test que verifica ausencia de nombre/email en el prompt | _Pendiente_ | _#_ |
| 21/10/2026 | A07 | `output: 'standalone'` para poder alojar Next.js en Azure sin reescritura | Exportación estática (rompe rutas dinámicas) | `next build` local | _Pendiente_ | _#_ |

## Pendientes con docentes (A10, antes del 23/10)

- [ ] ¿Se acepta CD con disparo manual (`workflow_dispatch`) como "despliegue continuo"? Registrar respuesta y fecha.
- [ ] ¿Cuándo puede cerrarse el entorno cloud de la demo del 09/11?
- [ ] ¿Se acepta demo local ante una caída externa, con validación cloud posterior?

## Cómo agregar una entrada

1. Describir la decisión concreta, no "se usó IA".
2. Listar al menos una alternativa descartada y por qué.
3. Indicar la evidencia (test, captura, log) y quién la revisó.
4. Si una persona corrigió el resultado, explicar qué cambió.
