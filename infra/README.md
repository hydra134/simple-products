# Admin infrastructure

Compose runs the frontend, backend, and PostgreSQL. Make provides shortcuts.
Install Docker with Compose and Make; OpenSSL generates credentials on first startup.

From the repository root:

```sh
make -C infra up
make -C infra down
```

`up` creates `infra/.env` when missing, builds the apps, starts all three services, and waits
for them to become healthy. Existing settings are preserved. `down` stops/removes containers
and the network while preserving database data. No project selection is needed.

## Hot reload

Compose automatically merges `compose.override.yaml` for local development. Both applications
use the shared `Dockerfile.dev` with development dependencies installed. The backend runs
`tsx watch`, and the frontend runs `next dev` with Fast Refresh.

Backend/frontend source directories and frontend public assets are mounted from the host.
Editing source files does not require rebuilding images or running a second watch command.
The backend also watches newly added route/plugin files. Container dependencies and Next.js
build output stay inside the containers; host `node_modules` and `.next` are not mounted.

After changing dependencies, package scripts, TypeScript/Next.js configuration, or shared root
files, run `make -C infra up` again to rebuild and recreate the affected containers.

The base `compose.yaml` still uses the application production Dockerfiles. To run production
builds without the development override:

```sh
cd infra
docker compose -f compose.yaml up --build -d --wait
```

## Configuration

`infra/.env.example` lists database settings and host ports. First startup generates a random
database password and writes `.env` with private permissions. Setup refuses to generate new
credentials if the existing database volume is found; recover its original `.env` instead.
Changing the password in `.env` does not change credentials stored in an existing database.

The Compose project remains `simple-products-admin`, and its PostgreSQL volume remains
`simple-products-admin_postgres_data`. Existing credentials were moved from
`infra/projects/admin/.env` to `infra/.env` without changing them.

Pinned Node/PostgreSQL image references live in `compose.yaml`. Application Dockerfiles own
the builds and use the repository-pinned pnpm version. The permanent root `.dockerignore`
excludes local credentials, dependencies, and generated files from the build context.

## Commands

```sh
make -C infra build                    # Build without starting
make -C infra ps                       # Service status
make -C infra logs                     # Follow all service logs
make -C infra logs SERVICE=backend     # Follow one service
make -C infra up SERVICE=postgres      # Start only PostgreSQL
make -C infra db-shell                 # Open psql
make -C infra check                    # Host static checks and application unit tests
```

Application tests and their package scripts are retained. There is no infrastructure test
stack or Docker test runner. `check` needs Node.js 24+ and pnpm 12.15.0; it does not need Docker.

To deliberately delete database data, run `make -C infra db-reset CONFIRM=admin`.
This checks volume ownership before deleting the admin database volume.

Compose can also be used directly after setup:

```sh
cd infra
docker compose up --build -d --wait
docker compose down
```

## Connections

- Frontend: `http://127.0.0.1:3000`.
- Backend: `http://127.0.0.1:3001`.
- PostgreSQL from the host: `127.0.0.1:5432`.
- Browser API requests use frontend `/api/...`; the server proxy connects to `backend:3001`.
- Backend readiness checks PostgreSQL; liveness does not.

Host ports can be changed in `.env`. Internal service names and ports stay the same.
