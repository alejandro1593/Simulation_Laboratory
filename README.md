# MolCore Lab — monorepo

Plataforma dual de química: **Laboratorio Académico** (simulador de experimentos,
tabla periódica, constructor de moléculas, tutor de balanceo) y **Zona de
Investigación** (gated, roadmap). La especificación técnica vive en
[MoleculeLab-Docs](https://github.com/alejandro1593) (`docs/`).

## Estructura

```
backend/   FastAPI (Python 3.12) — balanceador, simulador, tabla periódica, auth por zonas
frontend/  React 19 + TypeScript + Vite — SimBench (canvas), MolStar 3D, UI académica
infra/     docker-compose, Dockerfiles, CI (GitHub Actions)
docs/      spec v2 (zonas de acceso) — copia del entregable en Desktop/MoleculeLab-Docs
```

## Requisitos

- Python 3.12+ y Node 20+
- Docker (opcional, para el stack completo)

## Desarrollo rápido

### Backend (sin Docker)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
# tests
pytest -q
```

### Frontend (sin Docker)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # http://localhost:5173 (proxy /api -> :8000)
```

### Con Docker

```bash
docker compose -f docker-compose.dev.yml up --build
# API:  http://localhost:8000/docs   Frontend: http://localhost:5173
```

## Estado actual (Fase 1 — MVP Zona Académica)

- [x] Balanceador estequiométrico determinista (Gauss-Jordan sobre racionales) + tutor
- [x] Motor del simulador determinista + catálogo curado de experimentos (validador humano pendiente por entrada)
- [x] Tabla periódica interactiva (118 elementos) + reglas de valencia (constructor)
- [x] Auth JWT por zonas (Lobby / Académica / Investigación-gated)
- [ ] Cuaderno/progreso (siguiente sprint)
- [ ] Catálogo → 200 experimentos, gamificación, i18n (roadmap)

> Los datos de elementos y experimentos del MVP se marcan `snapshot: "mvp-v1"`; la
> trazabilidad definitiva (fuente+cita por dato) se conecta con el pipeline de ingestión.