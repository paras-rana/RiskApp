# RiskApp

RiskApp is a full-stack Enterprise Risk Management (ERM) application for creating, scoring, tracking, and reassessing organizational risks.

It includes:
- A React dashboard and risk register UI
- A NestJS API for risk, mitigation, and assessment workflows
- PostgreSQL storage (Docker-ready)

## Functional Overview

### 1. Risk Register
- Create risks with structured fields (title, category, department, owner, status, site/program, review due date).
- Capture inherent severity/probability at creation (1-5 scale each).
- Optionally capture initial residual severity/probability and notes.
- View a searchable, filterable, paginated risk table.

### 2. Dashboard Analytics
- View risks on a 5x5 risk matrix by **inherent** or **residual** basis.
- Click matrix cells to multi-select and filter the risk list.
- Filter further by category and department summaries.
- See risk-band groupings:
  - Low: score <= 6
  - Medium: score 7-14
  - High: score >= 15

### 3. Risk Detail Workflow
- View detailed risk profile and scoring cards.
- Add/edit mitigations with status, owner, dates, cost, control type, confidence, and notes.
- Mark mitigation directional impact flags (reduces severity and/or probability).
- Add/edit assessments (INHERENT or RESIDUAL) with scorer and rationale.
- Residual assessments update residual risk values and reassessment timestamp.

## Tech Stack

- Frontend: React 19, React Router, Vite
- API: NestJS 11
- Database: PostgreSQL 16
- Data Access: Prisma Client + PostgreSQL adapter (`@prisma/adapter-pg`) with SQL queries
- Infra: Docker Compose for local Postgres

## Repository Structure

```text
risk-app/
  api/      # NestJS backend
  web/      # React frontend
  infra/    # Docker Compose (Postgres)
```

## Data Model (Core Entities)

- `risks`
  - Main risk record with inherent and residual scoring fields
  - ID format: `R-001`, `R-002`, ... (generated in service layer)
- `mitigations`
  - Risk treatment actions linked to a risk
  - ID format: `M-0001`, `M-0002`, ...
- `risk_assessments`
  - Historical assessment entries (INHERENT / RESIDUAL)
  - Stores scorer, timestamp, and notes
- `risk_grid`
  - Grid metadata table (severity/probability cell mapping)

Note: API queries target the `erm` schema (for example `erm.risks`, `erm.mitigations`).

## API Endpoints

Base URL: `http://localhost:3000`

- `GET /risks`
  - List up to 500 risks for register/dashboard views
- `POST /risks`
  - Create a risk
- `GET /risks/:id`
  - Get one risk
- `GET /risks/:id/detail`
  - Get risk + mitigations + assessments in one payload
- `GET /risks/:id/mitigations`
  - List mitigations for a risk
- `POST /risks/:id/mitigations`
  - Create mitigation
- `PUT /risks/:id/mitigations/:mitigationId`
  - Update mitigation
- `GET /risks/:id/assessments`
  - List assessments for a risk
- `POST /risks/:id/assessments`
  - Create assessment
- `PUT /risks/:id/assessments/:assessmentId`
  - Update assessment

### Validation Rules (Backend)

- Severity and probability are integers from 1 to 5.
- Risk statuses: `Open`, `Monitoring`, `Mitigating`, `Accepted`, `Closed`.
- Mitigation statuses: `Planned`, `In Progress`, `Implemented`, `On Hold`, `Cancelled`.
- Assessment types: `INHERENT`, `RESIDUAL`.

## Local Development Setup

### Prerequisites
- Node.js 20+
- npm
- Docker Desktop (for Postgres)

### 1. Start PostgreSQL

```bash
cd infra
docker compose up -d
```

Postgres defaults from `infra/docker-compose.yml`:
- Host: `localhost`
- Port: `5432`
- DB: `riskapp`
- User: `postgres`
- Password: `postgres123`

### 2. Configure API environment

Create `api/.env` with:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/riskapp?schema=erm"
```

### 3. Install dependencies

```bash
cd api
npm install

cd ../web
npm install
```

### 4. Run backend

```bash
cd api
npm run start:dev
```

API runs at `http://localhost:3000` and enables CORS for `http://localhost:5173`.

### 5. Run frontend

```bash
cd web
npm run dev
```

UI runs at `http://localhost:5173`.

## UI Routes

- `/dashboard` - matrix analytics and filtered summaries
- `/risks` - risk register with create drawer and filters
- `/risks/:riskId` - risk detail with mitigation and assessment management

## Notes

- The frontend uses a fixed API base URL: `http://localhost:3000`.
- The backend currently uses SQL against existing `erm` schema tables.
- Ensure database schema/tables exist before running full workflows.

## Scripts

### API (`api/package.json`)
- `npm run start:dev` - run NestJS in watch mode
- `npm run build` - build backend
- `npm run test` - unit tests
- `npm run test:e2e` - e2e tests

### Web (`web/package.json`)
- `npm run dev` - Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
