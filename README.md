# TurnoSmart

SaaS multi-tenant de gestión de turnos con score de riesgo de ausencia y explicación con IA (Gemini).
UTN FRLP — Desarrollo de Software Cloud 2026. Checkpoint 2: **09/11/2026**.

Este repositorio contiene el alcance del **Desarrollador A** (autenticación, negocios, roles, clientes, IA, historial,
deploy del frontend, E2E y documentación). Los módulos de B (servicios, disponibilidad, slots, infraestructura Azure)
y C (agenda, reservas, eventos, score, observabilidad) se integran sobre los contratos de [`packages/shared`](packages/shared/src).

- [Estructura](#estructura)
- [Primera instalación (paso a paso)](#primera-instalación-paso-a-paso)
- [Uso diario](#uso-diario)
- [Pruebas](#pruebas)
- [Problemas frecuentes](#problemas-frecuentes)
- [Forma de trabajo en el repo](#forma-de-trabajo-en-el-repo)
- [API de A](#api-de-a) · [Documentación](#documentación)

## Estructura

```
apps/
  backend/    Express 5 + Prisma 6 + Supabase Auth + Gemini   (http://localhost:4000)
  frontend/   Next.js 16 + React 19 + MUI 9                   (http://localhost:3000)
packages/
  shared/     Contratos comunes: DTOs, validaciones zod, errores, roles
supabase/     Configuración de Supabase local (puertos, Auth)
docs/         Arquitectura, contratos, decisiones de IA, costos, backlog de A
```

Cómo se conectan las piezas en local:

```
Navegador (localhost:3000) ──login──► Supabase Auth local (127.0.0.1:54321)
           │
           └──datos──► API Express (localhost:4000) ──► PostgreSQL local (127.0.0.1:54322)
                                                    └──► Gemini (opcional)
```

Todo corre en tu computadora: **no hace falta ninguna cuenta en la nube para desarrollar**. El Supabase en la nube,
Azure y Vercel sólo se usan para la demo (ver [docs/architecture.md](docs/architecture.md)).

## Primera instalación (paso a paso)

Los comandos son para **PowerShell en Windows**. En Mac/Linux son iguales salvo el paso 4 (se indica la alternativa).
Todos se ejecutan **dentro de la carpeta `turnosmart`**, salvo el `git clone`.

### 0. Requisitos

| Herramienta | Versión | Cómo comprobar | Dónde conseguirla |
|---|---|---|---|
| Git | cualquiera reciente | `git --version` | https://git-scm.com |
| Node.js | **22** (ver `.nvmrc`); 24 también funciona en local | `node -v` | https://nodejs.org (LTS) |
| Docker Desktop | cualquiera reciente, **abierto y corriendo** | `docker info` (no debe dar error) | https://www.docker.com/products/docker-desktop |

No hace falta instalar la CLI de Supabase: se usa con `npx`. La primera vez que levantes Supabase, Docker descarga
varias imágenes (algunos GB): conviene hacerlo con buena conexión.

### 1. Clonar el repositorio y pasar a `dev`

```powershell
git clone https://github.com/yaelPilarL/turnosmart.git
cd turnosmart
git switch dev
```

`dev` es la rama de trabajo; `main` sólo recibe versiones probadas.

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Levantar Supabase local

Con Docker Desktop abierto:

```powershell
npx supabase start
```

Cuando termina muestra una tabla. Después podés volver a verla en cualquier momento con:

```powershell
npx supabase status
```

De esa salida necesitás **un solo dato**: la **Publishable key** (empieza con `sb_publishable_…`; en versiones viejas de
la CLI aparece como `anon key` y empieza con `eyJ…`).

> No uses la **Secret key** (`sb_secret_…`) ni la `service_role key`: saltean toda la seguridad de la base y no van
> en ningún archivo del proyecto.

### 4. Crear los archivos de configuración

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
Copy-Item apps/frontend/.env.example apps/frontend/.env.local
```

En Mac/Linux: `cp apps/backend/.env.example apps/backend/.env` y `cp apps/frontend/.env.example apps/frontend/.env.local`.

Abrí cada archivo y pegá la Publishable key del paso 3:

| Archivo | Línea a completar |
|---|---|
| `apps/backend/.env` | `SUPABASE_ANON_KEY=` |
| `apps/frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_ANON_KEY=` |

Las URLs y puertos que traen los ejemplos ya coinciden con Supabase local: no hay que cambiarlos.

**Opcional — IA:** para que funcione el botón "Explicar con IA", creá una clave gratuita en
https://aistudio.google.com/apikey (sin activar facturación) y pegala en `apps/backend/.env`, en `GEMINI_API_KEY=`.
Sin clave, todo funciona menos ese botón, que muestra "La IA no está configurada en este entorno".

Estos archivos están en `.gitignore`: **nunca se suben a GitHub**. Cada integrante tiene los suyos.

### 5. Crear las tablas

```powershell
npm run prisma:migrate -w @turnosmart/backend
```

Tiene que terminar en `All migrations have been successfully applied`.

### 6. Levantar la aplicación

En **dos terminales distintas** (las dos quedan corriendo):

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Comprobación: http://localhost:4000/health debe responder `{"status":"ok",…}` y http://localhost:3000 debe mostrar el login.

### 7. Crear tu usuario y entrar

La app no tiene registro público: las cuentas se crean desde Supabase Studio.

1. Abrí **Studio**: http://127.0.0.1:54323
2. **Authentication → Users → Add user → Create new user**.
3. Cargá un email (puede ser inventado, p. ej. `yo@test.com`) y una contraseña, y marcá **Auto Confirm User**.
4. Entrá a http://localhost:3000 con esos datos.
5. La primera vez la app pide **crear tu negocio**: quedás como dueño/a (`OWNER`). Ya podés cargar clientes.

Cada usuario nuevo crea su propio negocio y no ve los datos de los demás (aislamiento multi-tenant).

## Uso diario

| Para… | Comando |
|---|---|
| Levantar Supabase (Docker abierto) | `npx supabase start` |
| Levantar backend y frontend | `npm run dev:backend` y `npm run dev:frontend` (dos terminales) |
| Ver claves y puertos de Supabase | `npx supabase status` |
| Ver la base de datos | Studio: http://127.0.0.1:54323 → **Table Editor** |
| Aplicar migraciones nuevas (después de un `git pull`) | `npm run prisma:migrate -w @turnosmart/backend` |
| Apagar Supabase al terminar | `npx supabase stop` |

Los datos de Supabase local se conservan entre `stop` y `start`. Son **sólo tuyos**: no se comparten con el equipo ni
con el Supabase de la demo.

## Pruebas

| Comando | Qué cubre | Necesita |
|---|---|---|
| `npm test` | Unitarias + API con fakes: 401/403/404/422, onboarding, roles, aislamiento, CORS, errores, Gemini (timeout, cuota, respuesta inválida, límite) | Nada |
| `npm run test:integration` | API-Prisma-PostgreSQL real: persistencia, aislamiento entre dos negocios, onboarding concurrente | Supabase local levantado y migraciones aplicadas |
| `npm run test:e2e` | Recorrido crítico en navegador, sin mocks | Backend y frontend levantados, un usuario de prueba y Chromium de Playwright |
| `npm run typecheck` | Tipos de shared, backend y frontend | Nada |

Los comandos de integración y E2E **fallan** si falta su entorno: "no hay tests" nunca cuenta como éxito.

**Preparar el E2E (una sola vez):**

1. Instalar el navegador de pruebas:

   ```powershell
   npx playwright install chromium
   ```

2. Crear en Studio un usuario sólo para tests (p. ej. `e2e@test.com`, con **Auto Confirm User**).
3. Guardar sus datos en `apps/frontend/.env.e2e.local` (ignorado por git):

   ```
   E2E_USER_EMAIL=e2e@test.com
   E2E_USER_PASSWORD=la-contraseña-de-prueba
   ```

**Correr el E2E** (PowerShell, con backend y frontend levantados):

```powershell
Get-Content apps/frontend/.env.e2e.local | Where-Object { $_ -match '^\w+=' } | ForEach-Object { $k, $v = $_ -split '=', 2; Set-Item "Env:$k" $v }; npm run test:e2e
```

En Mac/Linux: `set -a && . apps/frontend/.env.e2e.local && set +a && npm run test:e2e`.

El reporte queda en `apps/frontend/playwright-report/`.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `npx supabase start` da error de Docker | Docker Desktop no está abierto. Abrilo, esperá a que diga *Running* y repetí. |
| `port is already allocated` al levantar Supabase | Otro proyecto de Supabase o un PostgreSQL ocupa los puertos 54321–54324. Detenelo (`npx supabase stop --project-id <otro>`) o cerrá ese servicio. |
| El backend no arranca: `Configuración de entorno inválida: SUPABASE_ANON_KEY` | Falta completar `apps/backend/.env` (paso 4). El mensaje nombra la variable que falta. |
| El login queda cargando o vuelve siempre a `/login` | Falta la clave en `apps/frontend/.env.local`. Next.js sólo lee ese archivo al arrancar: después de editarlo, cortá `npm run dev:frontend` (Ctrl+C) y volvé a correrlo. |
| "Email o contraseña incorrectos" con datos correctos | El usuario no tiene **Auto Confirm**. En Studio → Authentication → Users, borralo y crealo de nuevo marcando esa opción. |
| "No se pudo conectar con el servidor" | El backend no está corriendo (`npm run dev:backend`). |
| `Can't reach database server` al migrar o en `/ready` | Supabase local no está levantado (`npx supabase start`). |
| Supabase está levantado (`docker ps` lo muestra *healthy*) pero igual aparece `Can't reach database server` o "Failed to fetch" en el login | **Windows + WSL:** el proceso `wslrelay` tomó `127.0.0.1` en los puertos 54321–54324 y no reenvía las conexiones a Docker. Se confirma con `netstat -ano \| findstr 54322`: aparece un segundo proceso escuchando en `127.0.0.1`. Solución: cerrar Docker Desktop, ejecutar `wsl --shutdown`, volver a abrir Docker Desktop y correr `npx supabase start`. |
| "La IA no está configurada en este entorno" | Falta `GEMINI_API_KEY` en `apps/backend/.env`. Después de cargarla, reiniciá el backend. |
| "Turno no encontrado" al abrir `/appointments/<id>` | Los turnos los crea el módulo de C; el id no existe o es de otro negocio. |
| El E2E falla con `Executable doesn't exist` | Falta el navegador: `npx playwright install chromium`. |
| El E2E falla con `Definir E2E_USER_EMAIL…` | No se cargaron las variables del paso "Correr el E2E". |

## Forma de trabajo en el repo

- Ramas desde `dev`: `feat/A03-login`, `fix/B10-domain-grants`, `test/C09-concurrency`. Integración por PR a `dev`;
  `main` recibe versiones probadas.
- Revisión cruzada: B revisa A, C revisa B, A revisa C.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat:`, `fix:`, `docs:`, `test:`…),
  cada integrante con su propia cuenta.
- El CI de GitHub Actions corre tipos, tests y build en cada push y PR. El deploy a la nube es **manual**
  (Actions → *Frontend deploy (manual)*) y sólo en las ventanas acordadas.
- Uso de IA: registrar cada decisión relevante en [docs/AI-DECISIONS.md](docs/AI-DECISIONS.md).
- Nunca commitear archivos `.env`, claves, contraseñas ni cadenas de conexión.

## API de A

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
- [docs/costs.md](docs/costs.md): créditos, cuentas y costos por ventana (A11).
- [docs/backlog-dev-a.md](docs/backlog-dev-a.md): estado de A01–A11 y C07.
