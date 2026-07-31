# Docker README Reconciliation Design

## Goal

Make the README accurately describe the repository's current development and
production Docker Compose workflows.

## Scope

Update Docker-related README content without reorganizing unrelated
documentation. Include the minimal production Compose syntax correction needed
for the documented production command to validate.

## Compose correction

Change the `api.environment` block in `docker-compose.prod.yml` from invalid
list entries containing mappings to a normal YAML mapping:

```yaml
environment:
  NODE_ENV: production
  DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```

No other Compose behavior will change.

## README changes

- Describe the development stack as the `api` and `db` services from
  `docker-compose.yml`.
- Remove references to the deleted `docker-compose-local.yml` file and the
  removed Adminer service.
- Explain that Compose requires `POSTGRES_USER`, `POSTGRES_PASSWORD`, and
  `POSTGRES_DB`. These values initialize a new PostgreSQL volume but do not
  modify an existing database volume.
- Use `docker compose up -d db` for host-based development that only needs
  PostgreSQL.
- Document development stack startup, logs, status, migrations, restart,
  shutdown, and explicit local-volume deletion using the current Compose file.
- Add production startup and operational commands for
  `docker-compose.prod.yml`, `.env.prod`, and `Dockerfile.prod`.
- Use the explicit Compose project name `express-template-prod` in production
  commands so production containers and volumes do not collide with the
  development Compose project.
- Describe the actual production lifecycle: generate Prisma Client and compile
  during image build, then apply committed migrations and start the compiled API
  when the container starts.
- Update the repository tree and standalone production image commands to name
  the current Docker and Compose files.

## Safety and data handling

The README will distinguish between stopping containers while retaining the
database volume and deleting the volume with `down -v`. Volume deletion will be
described as appropriate only for disposable local data.

Production examples will use placeholder secrets and instruct readers to keep
`.env.prod` uncommitted.

## Verification

1. Run `docker compose config`.
2. Run
   `docker compose -p express-template-prod --env-file .env.example -f docker-compose.prod.yml config`
   as a syntax and interpolation check without starting containers.
3. Search the README for obsolete `docker-compose-local.yml`, Adminer, and
   multi-stage `Dockerfile` production-target references.
4. Review the final diff to confirm changes are limited to the approved Compose
   correction, README, and this design record.
