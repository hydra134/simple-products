# API

Fastify service generated from the official starter, adapted for this pnpm workspace.
Requires Node.js 24 or newer. Uses root ESLint/Prettier and the shared TypeScript catalog.

From the repository root:

```sh
pnpm --filter backend-admin-panel dev
pnpm --filter backend-admin-panel check
pnpm --filter backend-admin-panel build
pnpm --filter backend-admin-panel start
pnpm --filter backend-admin-panel test
```

The server defaults to `http://127.0.0.1:3001`. Set `PORT` and `HOST` to override;
use `HOST=0.0.0.0` when running in a container. `start` runs the compiled build.

- `GET /` returns `{ "root": true }`.
- `GET /example` returns the starter's example response.
- Plugins and routes are discovered automatically under `src/plugins` and `src/routes`.
- Tests run with Vitest using the shared root configuration without opening a port.

`pnpm --filter backend-admin-panel test:integration` runs the PostgreSQL integration tests.
Provide `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` for an isolated database
ending in `_integration`; tests skip if all five variables are absent. Ordinary `test` and
`check` commands do not require a database. `tsx` is used only by the development server.

`tsconfig.json` includes source and tests for type-checking and ESLint.
`tsconfig.build.json` emits only source to `dist` using NodeNext ESM resolution.
