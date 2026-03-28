# RiskApp

RiskApp is a full-stack application with two workspaces:
- Enterprise Risk Management (ERM) for creating, scoring, tracking, and reassessing organizational risks
- Portfolio and Project Management (PPM) for submitting, reviewing, prioritizing, and tracking project proposals and active work

It includes:
- A React dashboard and risk register UI
- A portfolio management workspace with proposal intake, review, future pipeline, and current project views
- A NestJS API for risk, mitigation, and assessment workflows
- Token-based login with a seeded admin account for local development
- PostgreSQL storage (Docker-ready)

## Application Flow (Narrative)

A typical workflow starts in the Risk Register, where a user captures a new risk with context such as category, ownership, status, and site/program. At this stage, the user records the inherent assessment (severity and probability) to represent the untreated level of exposure. Once saved, the system generates a risk ID, stores the record, and logs the assessment history.

From there, the user opens the Risk Detail page to manage the risk over time. Mitigations are added as concrete actions, each with status, owner, timing, and expected effect on severity and/or probability. As understanding improves or controls are implemented, the user records reassessments, especially residual assessments, to reflect the current post-mitigation position.

At the portfolio level, the Dashboard aggregates all risks into matrix views and summaries by category and department. Users can click matrix cells and summary rows to filter and investigate specific pockets of exposure. This creates a continuous loop: capture risk, assess baseline, execute mitigations, reassess residual exposure, and monitor trends across the organization.

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

### 4. Portfolio Intake and Review
- Submit new project proposals in structured sections for summary, resources, schedule, assumptions, risks, and attachments.
- Review submitted proposals from a dedicated queue with proposal detail pages and decision actions.
- Route proposals to current projects, future projects, archive, or keep them in the queue as WIP.
- Track approved work as either `Major project` or `Operations Initiative`.
- Use role-based executive sponsor selections in PPM (`CEO`, `CFO`, `COO`), with legacy seeded sponsor names normalized automatically.
- Export project detail slides with status, milestones, risks, and a milestone timeline visual.

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

Authentication:
- `POST /auth/login`
  - Public endpoint that returns a bearer token and current user details
- `GET /auth/me`
  - Returns the authenticated user for the supplied bearer token
- All `/risks` endpoints now require `Authorization: Bearer <token>`

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
AUTH_TOKEN_SECRET="replace-this-for-non-local-use"
ADMIN_EMAIL="admin@riskapp.local"
ADMIN_PASSWORD="Admin123!"
ADMIN_NAME="Risk Administrator"
```

On startup, the API creates `erm.app_users` if it does not exist and seeds the admin user above when missing.

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

### 6. Sign in

Use the seeded local admin account:

- Email: `admin@riskapp.local`
- Password: `Admin123!`

## UI Routes

- `/login` - login page for the local admin user
- `/dashboard` - matrix analytics and filtered summaries
- `/risks` - risk register with create drawer and filters
- `/risks/:riskId` - risk detail with mitigation and assessment management
- `/ppm/submit` - submit a new project proposal
- `/ppm/review` - proposal review queue
- `/ppm/review/:projectId` - detailed proposal review page
- `/ppm/future` - future pipeline and archived proposals
- `/ppm/current` - current projects grouped by classification
- `/ppm/projects/:projectId` - project detail and PowerPoint export
- `/ppm/strategic-priorities` - strategic priority period management

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
