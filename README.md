# ORBITA — Autonomous Intelligence for Space Infrastructure

A full-stack platform for autonomous space robotics mission planning, simulation, and risk analysis.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Next.js Frontend │────▶│  NestJS Backend  │────▶│ Python Intelligence  │
│     :3000         │     │     :4000        │     │     :8000            │
│ 3D Scene / HUD    │     │ REST API / WS    │     │ Orbital Mechanics    │
│ SWR Data Fetching │     │ Supabase/PostGIS │     │ Trajectory / Risk    │
└──────────────────┘     └──────────────────┘     └──────────────────────┘
                                  │
                           ┌──────▼──────┐
                           │   Supabase   │
                           │  PostgreSQL  │
                           │   + PostGIS  │
                           └─────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Three.js, React Three Fiber, Drei, Tailwind CSS, Motion v11 |
| Backend | NestJS, TypeScript, Supabase Client, class-validator, Swagger |
| Intelligence | Python 3.10+, FastAPI, NumPy, uvicorn |
| Database | Supabase (PostgreSQL + PostGIS + Realtime) |
| 3D Rendering | Three.js, custom GLSL shaders (Earth, atmosphere, clouds) |

## Project Structure

```
DEVENGERS_26/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── missions/           # Mission CRUD + state machine
│   │   ├── space-objects/      # Space object tracking
│   │   ├── satellites/         # Satellite management
│   │   ├── robots/             # Robot management
│   │   ├── telemetry/          # Telemetry + orbital states
│   │   ├── intelligence/       # Python service proxy
│   │   ├── simulation/         # Simulation runner
│   │   ├── mission-planner/    # AI mission planning
│   │   ├── supabase/           # Supabase client + realtime
│   │   └── common/             # Filters, interceptors, middleware
│   └── intelligence/           # Python FastAPI service
│       └── app/
│           ├── api/            # Route handlers
│           ├── orbital/        # Keplerian mechanics engine
│           ├── risk/           # Collision risk assessment
│           └── simulation/     # Simulation engine
│
├── research/                   # Next.js frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/
│   │   │   ├── space/          # 3D: Earth, Starfield, OrbitalPath, SpaceScene
│   │   │   ├── landing/        # Landing page sections
│   │   │   ├── layout/         # App shell, navigation
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── mission/        # Missions page
│   │   │   ├── simulation/     # Simulation page
│   │   │   ├── risk/           # Risk analysis page
│   │   │   ├── viewport/       # Digital twin page
│   │   │   └── ui/             # Reusable UI primitives
│   │   └── lib/
│   │       ├── api.ts          # API client + SWR hooks
│   │       └── motion/         # Camera parallax, scroll hooks
│   └── next.config.js          # API proxy configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase project

### 1. Backend (NestJS)

```bash
cd backend
npm install
npm run build
npm start
```

Runs on `http://localhost:4000`. API docs at `/api/docs`.

### 2. Intelligence Service (Python)

```bash
cd backend/intelligence
pip install -e .
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Runs on `http://localhost:8000`. Docs at `/docs`.

### 3. Frontend (Next.js)

```bash
cd research
npm install
npm run dev
```

Runs on `http://localhost:3000`. API requests proxied to `:4000`.

### Environment Variables

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
CORS_ORIGIN=http://localhost:3000
INTELLIGENCE_HOST=localhost
INTELLIGENCE_PORT=8000
```

**Frontend** (`research/.env`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## API Endpoints

### Core Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| GET | `/api/missions` | List missions (filterable) |
| POST | `/api/missions` | Create a mission |
| GET | `/api/missions/:id` | Get mission detail |
| PATCH | `/api/missions/:id` | Update mission |
| DELETE | `/api/missions/:id` | Delete mission |
| GET | `/api/satellites` | List satellites |
| GET | `/api/robots` | List robots |
| GET | `/api/space-objects` | List tracked objects |
| GET | `/api/telemetry/:id` | Telemetry for object |
| GET | `/api/orbital-states/:id` | Orbital states |

### Mission State Machine

```
DRAFT -> PLANNING -> VALIDATING -> READY -> SIMULATING -> COMPLETED
                                                   -> FAILED
                                                   -> PAUSED -> SIMULATING
                                                   -> ABORTING -> ABORTED
```

| Endpoint | Transition |
|----------|-----------|
| `POST /api/missions/:id/plan` | DRAFT -> PLANNING |
| `POST /api/missions/:id/validate` | PLANNING -> VALIDATING |
| `POST /api/missions/:id/ready` | VALIDATING -> READY |
| `POST /api/missions/:id/simulate` | READY -> SIMULATING |
| `POST /api/missions/:id/pause` | SIMULATING -> PAUSED |
| `POST /api/missions/:id/resume` | PAUSED -> SIMULATING |
| `POST /api/missions/:id/abort` | SIMULATING -> ABORTING |

### Intelligence & Simulation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/intelligence/health` | Service status |
| POST | `/api/intelligence/trajectory/plan` | Plan Hohmann transfer |
| POST | `/api/intelligence/risk/collision` | Assess collision risk |
| POST | `/api/simulation/run` | Run orbital simulation |

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Cinematic scroll-driven landing with 3D Earth |
| `/dashboard` | Orbital viewport with SpatialHUD |
| `/missions` | Mission timeline cards with detail panel |
| `/simulation` | Simulation lab with 3D viewport |
| `/risk` | Collision risk analysis |
| `/digital-twin` | Interactive orbital map |
| `/experiments` | Experiment runner |
| `/career` | Skills and operator progression |

## 3D Components

| Component | Description |
|-----------|-------------|
| `Earth` | Procedural GLSL Earth with oceans, landmasses, clouds, atmosphere |
| `Starfield` | 2500-point star field with color temperature |
| `OrbitalPath` | Elliptical path with animated satellite marker |
| `Satellite` | Solar panel satellite with orbit + hover label |
| `SpaceScene` | Composed scene with camera rig and parallax |
| `SpatialHUD` | DOM overlay with altitude, velocity, risk |

## Database Tables

| Table | Rows | Description |
|-------|------|-------------|
| `space_objects` | 126 | Tracked objects (satellites, debris, robots) |
| `satellites` | 21 | Satellite details |
| `robots` | 6 | Robot details |
| `missions` | 7 | Mission definitions |
| `mission_events` | 35 | Mission event log |
| `orbital_states` | 8 | Position/velocity state vectors |
| `telemetry` | 14 | Time-series telemetry |
| `reports` | 1 | Generated reports |

## Scripts

```bash
# Backend
cd backend
npm run start:dev     # Dev mode with watch
npm run build         # Production build
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests

# Frontend
cd research
npm run dev           # Dev server
npm run build         # Production build
npm run lint          # ESLint

# Intelligence
cd backend/intelligence
pip install -e ".[dev]"
pytest                # Run 50 orbital mechanics tests
```

## License

MIT
