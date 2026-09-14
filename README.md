# MolCore Lab

Plataforma web de química experimental **simulada de forma determinista**. Un
monolito modulado en dos capas:

- **Frontend** (React 19 + TypeScript + Vite): SimBench (canvas), visor 3D,
  estructuras esqueleto 2D, catálogos inorgánico/orgánico, quiz, calculadoras.
- **Backend** (FastAPI, Python 3.12): kernel determinista de balanceo/simulación,
  tabla periódica curada, auth JWT por zonas (Lobby / Académica / Investigación
  gated) y base de datos vía SQLAlchemy 2.

Proyecto desplegado en **Render** (web + API, blueprint `render.yaml`) con base
de datos **PostgreSQL en Neon** (free tier persistente).

## Regla del proyecto

> **No se inventa química.** Todos los datos (elementos, experimentos, masas
> molares, SMILES) están curados y se marcan `snapshot: "mvp-v1"`. Un SMILES solo
> se dibuja si está verificado; si no lo está, la tarjeta muestra el aviso
> "conectividad no verificada". El motor de reacciones calcula con aritmética
> racional y verifica conservación de masa y carga.

## Estructura

```
backend/   FastAPI (Python 3.12) — app/main.py, app/domain (kernel), app/api (routers)
frontend/  React 19 + TS + Vite — src/pages, src/components, src/data (curado)
render.yaml        Blueprint de Render (molcore-web + molcore-api)
docker-compose.yml Stack local: postgres + api + web (nginx)
.github/workflows/ ci.yml — ruff + pytest, npm ci + build, build de imágenes Docker
```

## Requisitos

- Python 3.12+
- Node 20+ (recomendado 22)
- Docker + Docker Compose (opcional, para el stack completo)

## Instalación y desarrollo

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  |  source .venv/bin/activate  # Unix
pip install -r requirements-dev.txt
cp ../.env.example .env           # opcional; sin .env usa defaults de desarrollo
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000 · Docs (Swagger): http://localhost:8000/docs
- Tests: `pytest -q` · Lint: `ruff check .`
- Por defecto la API usa **SQLite** (`sqlite:///./molcore.db`). Para Postgres
  apunta `DATABASE_URL` a tu conexión (ver [variables](#configuración)).

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173  (proxy /api -> localhost:8000)
```

No necesita variables de entorno: el cliente de API usa la ruta relativa
`/api/v1` y el proxy de Vite la resuelve hacia el backend en desarrollo.

- Build: `npm run build` (`tsc -b && vite build`) · Preview del build en :4173
- PWA: service worker y manifiesto se activan en build de producción (offline shell).

### Stack completo con Docker

```bash
docker compose up --build
```

| Servicio | URL                      |
| -------- | ------------------------ |
| Web (nginx + SPA + proxy /api) | http://localhost:8080 |
| API (FastAPI)                   | http://localhost:8000/docs |
| PostgreSQL                      | localhost:5433 (molcore/molcore) |

El nginx del contenedor `web` proxya `/api/*` hacia el servicio `api`, así que
el navegador habla con un solo origen (sin CORS). La variable `API_UPSTREAM`
define ese destino (local: `http://api:8000`).

## Configuración

El backend lee variables desde `backend/.env` (o variables de entorno). Plantilla
en `.env.example`. Resumen:

| Variable             | Default              | Descripción |
| -------------------- | -------------------- | ----------- |
| `DATABASE_URL`       | `sqlite:///./molcore.db` | DSN SQLAlchemy (SQLite local, PostgreSQL/Neon en prod) |
| `JWT_SECRET`         | `change-me-please`   | **Cambiar en producción** (siempre) |
| `JWT_ACCESS_TTL_MIN` | `15`                 | Expiración del access token (min) |
| `JWT_REFRESH_TTL_DAYS` | `14`               | Expiración del refresh token (días) |
| `JWT_ALGORITHM`      | `HS256`             | Algoritmo JWT |
| `CORS_ORIGINS`       | `["http://localhost:5173"]` | Orígenes permitidos (lista separada por comas) |
| `DEBUG`              | `false`              | Modo debug / hot reload |
| `SNAPSHOT_VERSION`   | `mvp-v1`             | Etiqueta de trazabilidad del dataset |

## Producción (Render + Neon)

El despliegue es automático desde `main`:

1. **GitHub Actions** corre ruff + pytest, build del frontend y build de las
   imágenes Docker.
2. **Render** lee `render.yaml` (blueprint auto-sync) y despliega:
   - `molcore-web`: nginx sirve la SPA y proxya `/api` al backend (mismo origen).
   - `molcore-api`: FastAPI en Docker (workers=1), health check en
     `/api/v1/health`.
3. **Neon** (PostgreSQL serverless): la API recibe la credencial vía la variable
   `DATABASE_URL` (manual en el dashboard de Render, no commiteada). Las tablas
   se crean solas al arrancar (`create_all`).

> Por qué no Postgres gratis de Render: su tier free **destruye la base a los 30
> días**. Neon en free tier persiste mientras haya actividad, así que no se
> pierden cuentas ni progreso.

En producción el navegador habla solo con `https://molcore-web.onrender.com`;
el proxy nginx resuelve la API en runtime usando su URL pública.

## Características (Zona Académica)

- **Simulador de experimentos** — kernel determinista, conservación de masa y carga.
- **Tabla periódica interactiva** (118 elementos) + **quiz** (2 modalidades).
- **Constructor de moléculas** + **visor 3D** y **estructura 2D esqueletal**
  (SMILES verificados, `smiles-drawer`).
- **Catálogos** inorgánico y orgánico (35 compuestos de interés cotidiano,
  29 con estructura 2D + 3D).
- **Tutor de balanceo** de ecuaciones.
- **Calculadoras y herramientas**: masa molar por fórmula, concentraciones,
  conversiones, toxicología, soluciones, valoración, termoquímica, VSEPR,
  isomería, ensayos a la llama, laboratorio libre y retos.
- **Auth JWT** por zonas (estudiante académico por defecto) con registro/login,
  progreso y favoritos por usuario.
- **PWA** instalable con shell offline.
- **Repo de investigación** sellado en el roadmap.

## Tests y CI

- Backend: `pytest` (66 tests: auth, kernel de balanceo, simulador, tabla).
- Frontend: `tsc -b` como parte del build + build de producción Vite.
- `.github/workflows/ci.yml` ejecuta todo en cada push a `main`.

## Licencia / estado

MVP con datos curados (`mvp-v1`). Roadmap: cuaderno/progreso, gamificación,
más experimentos y trazabilidad con fuente por dato.