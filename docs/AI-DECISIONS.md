# Decisiones asistidas por IA

Registro exigido por el TPI (p. 2): qué se generó o propuso con IA, qué alternativas se evaluaron, cómo se validó y
qué corrigió una persona. Cada entrada se vincula con su PR o, si no hubo PR, con su commit.

Herramienta usada por A: Claude Code. La IA no figura como autora de commits; su uso se documenta acá.

| Fecha | Tarea | Decisión | Alternativas | Validación | Revisión humana | PR / commit |
|---|---|---|---|---|---|---|
| 21/10/2026 | A01–A08, C07 | Andamiaje inicial del alcance de A generado con Claude Code a partir del plan del Checkpoint 2 | — | `npm test` (36 casos), typecheck y build | Yael: puso en marcha el entorno local, inició sesión, hizo el onboarding y cargó un cliente desde la UI. Revisión de código por B pendiente | `adb45c5` |
| 21/10/2026 | A03 | Validar tokens con `supabase.auth.getUser` | Verificar JWT localmente con JWKS (menos latencia, no detecta usuarios eliminados) | Tests 401 con fakes; E2E con token real de Supabase local (3/3) | Yael: login probado en la app local. Logout cubierto por el E2E | `adb45c5` |
| 21/10/2026 | A04 | Idempotencia del onboarding vía PK de `Profile` + captura de `P2002` | Lock de fila / `SELECT … FOR UPDATE` | Test de integración contra PostgreSQL real con 5 requests concurrentes (5/5 tests) | Revisión por B pendiente | `adb45c5` |
| 21/10/2026 | A08 | Salida estructurada JSON + zod, un reintento sólo por formato inválido | Texto libre; reintentos con backoff | Tests de timeout, cuota, respuesta inválida y límite; llamada real a `gemini-3.5-flash-lite` | Yael: creó la clave Free de Gemini y verificó una explicación real en la app | `adb45c5` |
| 21/10/2026 | A08 | Sólo factores agregados al prompt (`sanitizeFactors`) | Enviar contexto del turno | Test que verifica ausencia de nombre/email en el prompt | Revisión por B pendiente | `adb45c5` |
| 21/10/2026 | A07 | `output: 'standalone'` para poder alojar Next.js en Azure sin reescritura | Exportación estática (rompe rutas dinámicas) | `next build` local | Revisión por B pendiente; destino final (Vercel o Azure) a decidir con B | `adb45c5` |
| 21/10/2026 | A08 | **Corrección del tono de Gemini.** La instrucción original pedía "español rioplatense" y el modelo respondió con lunfardo y expresiones despectivas sobre el cliente. Se reemplazó por "español claro y profesional, tono cordial, voseo permitido, sin vulgaridades, números en cifras" | Filtrar palabras en la respuesta (frágil); dejar el tono libre | Nueva llamada real: explicación en tono profesional; 36 tests unitarios | **Detectado en la prueba real de Yael** (captura con la respuesta original). La IA propuso el ajuste del prompt; Yael lo validó con una nueva captura | `232b258` |
| 21/10/2026 | A04 | **Zona horaria automática.** El onboarding pedía escribir la zona IANA a mano; ahora se detecta desde el navegador y en Negocio se elige con un selector con búsqueda | Quitar el campo y fijar Argentina; mantener texto libre | Typecheck, build; detección y desfasajes verificados con Node (incluye UTC+05:30 y horario de verano) | **Iniciado por Yael**, que cuestionó por qué se pedía la zona horaria y pidió mejorar la experiencia | `25772ff` |
| 21/10/2026 | A05/A10 | **Rediseño de la interfaz**: tema propio claro/oscuro, navegación lateral, login con panel de marca, estados vacíos y de carga, medidor de score y línea de tiempo | Mantener estilos por defecto de MUI | Revisión visual en escritorio, móvil, claro y oscuro; E2E 3/3 | **Pedido por Yael.** Durante la revisión se corrigieron contraste de avatares y fondo del menú en modo oscuro | `25772ff` |
| 21/10/2026 | A05 | Errores de validación del formulario de cliente mostrados por el servidor en cada campo (`noValidate`), en vez del globo nativo del navegador | Validación nativa del navegador (mensaje en el idioma del navegador) | E2E con email inválido | Revisión por B pendiente | `25772ff` |

## Pendientes con docentes (A10, antes del 23/10)

- [ ] ¿Se acepta CD con disparo manual (`workflow_dispatch`) como "despliegue continuo"? Registrar respuesta y fecha.
- [ ] ¿Cuándo puede cerrarse el entorno cloud de la demo del 09/11?
- [ ] ¿Se acepta demo local ante una caída externa, con validación cloud posterior?

Consulta enviada: _fecha, canal_ · Respuesta: _fecha, quién respondió, texto resumido_

## Cómo agregar una entrada

1. Describir la decisión concreta, no "se usó IA".
2. Listar al menos una alternativa descartada y por qué.
3. Indicar la evidencia (test, captura, log) y quién la revisó.
4. Si una persona corrigió el resultado, explicar qué cambió.
