# Docker README Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the README accurately document both current Docker Compose workflows and make the production Compose file valid.

**Architecture:** Keep the existing README structure and reconcile only Docker-related content. Correct the production Compose environment syntax first, then document the development and production workflows directly from the validated Compose and Dockerfile behavior.

**Tech Stack:** Markdown, Docker Compose, Docker, PostgreSQL 16, Node.js 22, Prisma 7

## Global Constraints

- Preserve unrelated README content and all unrelated worktree changes.
- Remove obsolete references to `docker-compose-local.yml` and Adminer.
- Treat `docker-compose.yml` as the development stack and `docker-compose.prod.yml` as the production stack.
- Use the production Compose project name `express-template-prod` to isolate its containers and volumes.
- Do not delete or recreate a database volume during verification.
- The repository has no test framework; use Compose validation and focused text searches.

---

### Task 1: Correct production Compose environment syntax

**Files:**
- Modify: `docker-compose.prod.yml:12-15`

**Interfaces:**
- Consumes: `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` supplied through Compose interpolation.
- Produces: A valid `api.environment` mapping consumed by Docker Compose and documented in Task 2.

- [x] **Step 1: Confirm the current syntax failure**

Run:

```bash
docker compose -f docker-compose.prod.yml config --no-interpolate
```

Expected: failure containing:

```text
services.api.environment.[0]: unexpected type map[string]interface {}
```

- [x] **Step 2: Replace the invalid list entries with a mapping**

Change:

```yaml
    environment:
      - NODE_ENV: production
      - DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

to:

```yaml
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

- [x] **Step 3: Validate the corrected YAML structure**

Run:

```bash
docker compose -f docker-compose.prod.yml config --no-interpolate
```

Expected: the environment type error is absent. If Compose reports only that
`.env.prod` is missing, the YAML structure is valid and full interpolation will
be checked after creating a temporary validation copy in Task 2.

- [x] **Step 4: Review the focused diff**

Run:

```bash
git diff --check -- docker-compose.prod.yml
git diff -- docker-compose.prod.yml
```

Expected: no whitespace errors and only the two environment-entry markers are
removed.

### Task 2: Reconcile README Docker documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: The service names, environment variables, commands, build files,
  health dependency, volume, and lifecycle defined by `docker-compose.yml`,
  `docker-compose.prod.yml`, `Dockerfile`, and `Dockerfile.prod`.
- Produces: Development, production, and standalone-image instructions that
  execute against the current files.

- [x] **Step 1: Update Docker technology and environment descriptions**

Make these exact semantic changes:

```markdown
- Docker Compose
```

Replace the claim that Compose variables are optional with:

```markdown
Docker Compose requires `POSTGRES_USER`, `POSTGRES_PASSWORD`, and
`POSTGRES_DB`. `POSTGRES_PORT` is optional and defaults to `5432`.
`docker-compose.yml` reads application variables from `.env`;
`docker-compose.prod.yml` reads them from `.env.prod`.
```

Use the current `.env.example` local database URL:

```text
postgresql://postgres:postgres@localhost:5432/nus_express_template
```

- [x] **Step 2: Update host-based database startup**

Replace the deleted local-Compose and Adminer instructions with:

Start only PostgreSQL:

```bash
docker compose up -d db
```

PostgreSQL is available at `localhost:5432` by default. Its username, password,
database name, and optional host port come from `.env`.

Keep the existing Prisma generation, migration, and host API startup steps.

- [x] **Step 3: Update the development Compose section**

Document:

```bash
docker compose up --build
docker compose up -d --build
docker compose logs -f api
docker compose ps
docker compose exec api yarn db:migrate --name describe_change
docker compose restart api
docker compose down
docker compose down -v
```

State that:

- the stack contains `api` and `db`;
- the API waits for a healthy database and `yarn dev` generates Prisma Client
  before starting the watcher;
- migrations are run explicitly;
- `down` retains `postgres_data`;
- `down -v` deletes disposable local database data;
- changing `POSTGRES_*` values does not change an already-initialized volume.

- [x] **Step 4: Add the production Compose section**

Add these setup and startup commands:

```bash
cp .env.example .env.prod

docker compose -p express-template-prod \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  up -d --build
```

Instruct the reader to set `NODE_ENV=production`, strong token secrets, and
production PostgreSQL credentials in `.env.prod`, and not commit the file.

Document these operational commands:

```bash
docker compose -p express-template-prod \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  logs -f api

docker compose -p express-template-prod \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  ps

docker compose -p express-template-prod \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  down
```

Explain that `Dockerfile.prod` generates Prisma Client and compiles TypeScript
during the image build, then runs `yarn db:migrate-prod` before `yarn start`
when the container starts.

- [x] **Step 5: Update the repository tree and deployment examples**

Use this Docker-related tree ending:

```text
├── Dockerfile                         # Development API image
├── Dockerfile.prod                    # Production API image
├── docker-compose.yml                 # Development API and PostgreSQL
└── docker-compose.prod.yml            # Production API and PostgreSQL
```

Replace the obsolete multi-stage production build command with:

```bash
docker build -f Dockerfile.prod -t nus-express-api .
```

Update deployment prose to state that this production image contains the
Prisma CLI and applies committed migrations before starting the API. Retain the
warning that production credentials must come from a secure configuration
system.

- [x] **Step 6: Validate both Compose workflows**

Run:

```bash
docker compose config
```

Expected: exit code 0, with development services `api` and `db`.

Temporarily copy the non-secret example environment for validation, run the
production config check, then remove only that temporary copy:

```bash
cp .env.example .env.prod
docker compose -p express-template-prod --env-file .env.prod -f docker-compose.prod.yml config
rm .env.prod
```

Expected: exit code 0, with production services `api` and `db`, and no
environment type error. Before creating or removing `.env.prod`, confirm that
it does not already exist; never overwrite a user-owned environment file.

- [x] **Step 7: Check documentation consistency**

Run:

```bash
rg -n 'docker-compose-local|Adminer|--target production|slim production image|does not include the Prisma CLI|does not automatically run migrations' README.md
```

Expected: no matches.

Run:

```bash
rg -n 'docker compose|docker-compose\\.prod|Dockerfile\\.prod|POSTGRES_USER|down -v' README.md
git diff --check -- README.md docker-compose.prod.yml
git diff -- README.md docker-compose.prod.yml
```

Expected: all current Docker workflows are discoverable, there are no
whitespace errors, and the diff is limited to approved documentation plus the
production Compose syntax correction.

### Task 3: Final verification

**Files:**
- Verify: `README.md`
- Verify: `docker-compose.yml`
- Verify: `docker-compose.prod.yml`
- Verify: `Dockerfile`
- Verify: `Dockerfile.prod`

**Interfaces:**
- Consumes: The completed changes from Tasks 1 and 2.
- Produces: Evidence that the README matches the repository's current Docker
  behavior without starting or deleting containers.

- [x] **Step 1: Re-read each documented lifecycle against source**

Compare the README commands with:

```bash
sed -n '1,180p' docker-compose.yml
sed -n '1,180p' docker-compose.prod.yml
sed -n '1,180p' Dockerfile
sed -n '1,180p' Dockerfile.prod
```

Expected: service names, environment files, build files, startup commands, and
volume behavior match the README.

- [x] **Step 2: Confirm only approved files changed during implementation**

Run:

```bash
git status --short
git diff --name-only -- README.md docker-compose.prod.yml
```

Expected: implementation changes appear only in `README.md` and
`docker-compose.prod.yml`; pre-existing unrelated worktree changes remain
untouched.
