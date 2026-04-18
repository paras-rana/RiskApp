# RiskApp

RiskApp is a full-stack web application with two business workspaces:

- `ERM` (Enterprise Risk Management) for recording, scoring, monitoring, and reassessing organizational risks
- `PPM` (Portfolio and Project Management) for intake, review, prioritization, and tracking of projects and strategic initiatives

The repository combines a React single-page application, a NestJS API, and a PostgreSQL-backed ERM data layer for local development.

## Table of Contents

- [Overview](#overview)
- [Core Functions](#core-functions)
- [How the Application Works](#how-the-application-works)
- [Screens and Routes](#screens-and-routes)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Backend Capabilities](#backend-capabilities)
- [Data and Persistence Model](#data-and-persistence-model)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Authentication](#authentication)
- [API Summary](#api-summary)
- [Current Constraints and Notes](#current-constraints-and-notes)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [License](#license)

## Overview

RiskApp is designed to support two related operational workflows in one interface.

The `ERM` workspace is used to manage enterprise risks from initial identification through mitigation and reassessment. Users can create risks, assign owners, maintain mitigation plans, capture inherent and residual assessments, and review aggregated exposure through matrix-style dashboards.

The `PPM` workspace is used to manage the front end of portfolio governance. Users can submit project proposals, review them, move work into future or active states, maintain strategic priority periods, manage annual operational initiatives, track current projects, and view project detail records with supporting artifacts and status updates.

## Core Functions

### ERM

- Create and maintain risk records with structured metadata
- Capture inherent and residual risk assessments
- Record mitigation actions and track their status over time
- Review risk details, assessment history, and mitigation progress
- Analyze risk exposure through dashboard summaries and matrix views

### PPM

- Submit new project or initiative proposals
- Review proposals and approve, deny, hold, or keep work in progress
- Organize work into submitted, future, current, and archived states
- Explore the portfolio dashboard through clickable summary cards and delivery-status drilldowns
- Track strategic priority periods and related priorities
- Maintain annual operational initiatives aligned to strategic priorities
- Align major projects and operational projects through annual operational initiatives
- Maintain project details such as milestones, team members, documents, and weekly updates
- Export project detail content into PowerPoint-ready output

## How the Application Works

### ERM Workflow

1. A user creates a risk in the register with ownership, category, status, and review metadata.
2. The user captures the initial inherent severity and probability.
3. The risk detail view is used to manage mitigations and assessment history.
4. Residual assessments are added as controls mature or conditions change.
5. Dashboards aggregate risks into matrix and summary views for analysis.

### PPM Workflow

1. Strategic priority periods are maintained separately, with current and historical period registers.
2. Annual operational initiatives are created under a strategic priority for a specific year.
3. A user submits a project proposal with summary, schedule, staffing, assumptions, risks, documents, and annual operational initiative alignment.
4. Reviewers evaluate the proposal and move it to current work, future work, archive, or work-in-progress.
5. The portfolio dashboard summarizes current, future, and submitted work and supports drilldown by project grouping or delivery status.
6. Approved work is tracked as either a major project or an operational project with milestones, document versions, weekly or monthly updates, and team assignments.

## Screens and Routes

### Shared

- `/login` - sign-in page
- `/dashboard` - workspace-sensitive landing page after login

### ERM

- `/risks` - risk register
- `/risks/:riskId` - risk detail page

### PPM

- `/dashboard` - PPM portfolio dashboard with summary-card and status-based project drilldowns when the PPM workspace is active
- `/ppm/submit` - proposal submission form
- `/ppm/review` - proposal review queue
- `/ppm/review/:projectId` - review detail page
- `/ppm/future` - future pipeline and archived views
- `/ppm/current` - active project tracking
- `/ppm/projects/:projectId` - project detail view
- `/ppm/strategic-priorities` - current strategic priorities view
- `/ppm/strategic-priorities/register` - historical strategic priority period register
- `/ppm/strategic-priorities/new` - create a new strategic priority period
- `/ppm/operational-initiatives` - current annual operational initiatives view
- `/ppm/operational-initiatives/register` - historical annual operational initiatives register
- `/ppm/operational-initiatives/new` - create a new annual operational initiative

## Architecture

RiskApp is split into three main layers:

- `web/` contains the React frontend and all route-level UI for ERM and PPM
- `api/` contains the NestJS backend, authentication, and ERM APIs
- `infra/` contains local infrastructure configuration for PostgreSQL

### Frontend

The frontend is a React SPA using React Router. It enforces authentication and routes users into either ERM or PPM views based on the active workspace.

ERM pages call the backend API through a small fetch wrapper in `web/src/lib/api.js`.

PPM is currently implemented as a frontend-managed module. Its project, strategic-priority, and annual-operational-initiative data are seeded in the browser and persisted in `localStorage` through `PpmProjectsContext`. That means PPM does not currently depend on the NestJS API or PostgreSQL for its main data flow.

The portfolio dashboard itself is interactive: summary cards open filtered project tables for major, operational, future, and submitted work, and the status section groups all projects into red, yellow, and green drilldowns.

### Backend

The backend is a NestJS application with a focused module structure:

- `AuthModule` handles login, token validation, and current-user resolution
- `PrismaModule` manages database access
- `RisksModule` exposes ERM risk, mitigation, and assessment endpoints

The backend currently serves ERM functionality. There is no dedicated PPM API module in the current codebase.

## Technology Stack

- Frontend: React 19, React Router 7, Vite
- Backend: NestJS 11
- Database: PostgreSQL 16
- Data access: Prisma Client with `@prisma/adapter-pg`
- Auth: bearer-token based application auth
- Infra: Docker Compose for local Postgres
- Document export: `pptxgenjs`

## Repository Structure

```text
risk-app/
  api/
    src/
      auth/
      prisma/
      risks/
  web/
    src/
      auth/
      components/
      lib/
      pages/
      ppm/
  infra/
  README.md
```

### High-Level Layout

- `api/src/auth/` contains login and auth guard logic
- `api/src/prisma/` contains database bootstrap and client wiring
- `api/src/risks/` contains ERM API controllers, service logic, and tests
- `web/src/pages/` contains route-level pages for ERM and PPM
- `web/src/auth/` contains frontend auth context and session handling
- `web/src/ppm/` contains PPM configuration and state management
- `web/src/components/` contains shared UI components such as matrix visualizations
- `infra/` contains Docker-based local database setup

## Backend Capabilities

The backend currently supports:

- Application startup with environment-based config
- CORS for local frontend development on `http://localhost:5173`
- Login and authenticated user lookup
- Risk listing and retrieval
- Risk creation
- Mitigation creation, retrieval, and update
- Assessment creation, retrieval, and update
- Combined risk detail retrieval

## Data and Persistence Model

### ERM Persistence

ERM data is stored in PostgreSQL and accessed through the NestJS backend. The codebase references the `erm` schema and works with core entities such as:

- `risks`
- `mitigations`
- `risk_assessments`
- `risk_grid`
- `app_users`

Risk and mitigation identifiers are generated in the service layer.

### PPM Persistence

PPM data is currently persisted in the browser using `localStorage`.

Primary client-side stores:

- `riskapp.ppm.projects`
- `riskapp.ppm.priorities`
- `riskapp.ppm.operational-initiatives`

Seeded PPM data is normalized on load, including legacy executive sponsor names that are mapped to role-based labels such as `CEO`, `CFO`, and `COO`, and legacy operational initiative classification values that are normalized to `Operational project`.

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop

### 1. Start PostgreSQL

```bash
cd infra
docker compose up -d
```

Default local database values:

- Host: `localhost`
- Port: `5432`
- Database: `riskapp`
- User: `postgres`
- Password: `postgres123`

### 2. Configure the API

Create `api/.env` with:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/riskapp?schema=erm"
AUTH_TOKEN_SECRET="replace-this-for-non-local-use"
ADMIN_EMAIL="admin@riskapp.local"
ADMIN_PASSWORD="Admin123!"
ADMIN_NAME="Risk Administrator"
```

On startup, the application seeds the local admin user if it does not already exist.

### 3. Install Dependencies

```bash
cd api
npm install

cd ../web
npm install
```

### 4. Run the API

```bash
cd api
npm run start:dev
```

The backend runs on `http://localhost:3000`.

### 5. Run the Frontend

```bash
cd web
npm run dev
```

The frontend runs on `http://localhost:5173`.

### 6. Sign In

Use the seeded local account:

- Email: `admin@riskapp.local`
- Password: `Admin123!`

## Environment Variables

The current backend expects these environment variables:

- `DATABASE_URL`
- `AUTH_TOKEN_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

The frontend currently uses a fixed API base URL of `http://localhost:3000`.

## Available Scripts

### API

- `npm run build` - build the NestJS application
- `npm run start` - run the API
- `npm run start:dev` - run the API in watch mode
- `npm run start:debug` - run the API in debug watch mode
- `npm run start:prod` - run the compiled server
- `npm run lint` - lint backend files
- `npm run test` - run unit tests
- `npm run test:watch` - run tests in watch mode
- `npm run test:cov` - run tests with coverage
- `npm run test:e2e` - run end-to-end tests

### Web

- `npm run dev` - start the Vite development server
- `npm run build` - build the frontend
- `npm run lint` - lint frontend files
- `npm run preview` - preview the production build

## Authentication

Authentication is token-based.

- `POST /auth/login` returns a bearer token and user payload
- `GET /auth/me` returns the current authenticated user
- Protected ERM endpoints require `Authorization: Bearer <token>`

The frontend stores auth context and uses route guards to redirect unauthenticated users to `/login`.

## API Summary

Base URL: `http://localhost:3000`

### Auth

- `POST /auth/login`
- `GET /auth/me`

### Risks

- `GET /risks`
- `POST /risks`
- `GET /risks/:id`
- `GET /risks/:id/detail`
- `GET /risks/:id/mitigations`
- `POST /risks/:id/mitigations`
- `PUT /risks/:id/mitigations/:mitigationId`
- `GET /risks/:id/assessments`
- `POST /risks/:id/assessments`
- `PUT /risks/:id/assessments/:assessmentId`

## Current Constraints and Notes

- ERM is the only workspace currently backed by the NestJS API and PostgreSQL.
- PPM currently uses seeded browser data and `localStorage`, so it is suitable for UI workflow development but not yet a shared multi-user persistence model.
- The frontend API base URL is hardcoded for local development.
- Backend CORS is configured for `http://localhost:5173`.
- The README describes the current repository state, not a target future architecture.

## Testing

Backend test files exist under `api/src` and the backend includes Jest-based unit and e2e test scripts.

Frontend lint and build scripts are available through Vite and ESLint. Frontend automated test infrastructure is not currently defined in `web/package.json`.

## Future Improvements

- Add a backend persistence layer and API surface for PPM
- Move frontend API configuration to environment-based settings
- Expand automated frontend test coverage
- Add deployment-specific documentation for non-local environments
- Document database schema creation and migration strategy in more detail

## License

The API package is marked `UNLICENSED`. No separate repository-wide license file is currently included.
