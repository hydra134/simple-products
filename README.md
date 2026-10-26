# simple-products

TypeScript monorepo powered by pnpm and Turborepo.

## Run the full stack

With Docker running:

```sh
make -C infra up
make -C infra down
```

`up` handles setup, builds, and startup for the frontend, backend, and PostgreSQL, with
frontend Fast Refresh and automatic backend restarts when source files change.
`down` stops the stack and preserves database data. See [infra/README.md](infra/README.md)
for configuration and other commands.

## Fastify API

Run `pnpm --filter backend-admin-panel dev` to start the API at `http://127.0.0.1:3001`.
Run `pnpm --filter backend-admin-panel check` for formatting, linting, type-checking, and tests.
For production, run `pnpm --filter backend-admin-panel build` followed by
`pnpm --filter backend-admin-panel start`.
The API extends the root TypeScript config with NodeNext settings and reuses root lint/format
configs. See `apps/backend-admin-panel/README.md` for routes and environment settings.

## Workspace layout

- `apps/*` — deployable Next.js and Node.js applications
- `packages/*` — shared libraries and configuration packages

Every workspace package should extend `tsconfig.base.json` and provide its own `build`, `lint`,
`typecheck`, and `dev` scripts when applicable.

## Commands

- `pnpm dev` — run workspace applications in development mode
- `pnpm build` — build all workspace packages
- `pnpm lint` — lint TypeScript, JavaScript, and CSS
- `pnpm typecheck` — type-check all workspace packages
- `pnpm format` — format the repository
- `pnpm test` — run all application unit tests with Vitest
- `pnpm test:watch` — watch and rerun tests during development
- `pnpm test:integration` — run PostgreSQL integration tests
- `pnpm check` — run all static checks and application unit tests

## Tests

All JavaScript, TypeScript, and TSX tests use the shared `vitest.config.js`. Name unit tests
`*.test.*` or `*.spec.*`; the runner discovers them throughout the repository. Tests use the
Node environment by default. Import test APIs explicitly from `vitest`; no test globals are
added to application types. See the [Vitest configuration docs](https://vitest.dev/config/).

Run one app with `pnpm --filter backend-admin-panel test` or
`pnpm --filter front-admin-panel test`. Tests under `test/integration/` run separately through
`pnpm test:integration`; they currently skip when PostgreSQL settings are absent. To execute
them, provide `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` for an isolated database
whose name ends in `_integration`. Do not point integration tests at the normal admin database.

## ESLint

TypeScript files use `strictTypeChecked` with `projectService`, which finds each workspace's
`tsconfig.json`. Include source files in that config; a shared base config alone is not a project.
JavaScript configuration files are linted without requiring a TypeScript project.

React Hooks rules apply to source files, including custom hooks in `.ts` files. JSX/TSX files use
Fast Refresh rules, and JSX/TSX under `apps/*` additionally use Next.js Core Web Vitals rules and
Next-compatible Fast Refresh exports (`metadata`, `revalidate`, etc.). Keep shared React components
in `packages/*`; Fastify services use the same strict TypeScript rules without Next.js rules.

Prettier runs as an ESLint rule using the root `.prettierrc`. Run `pnpm exec eslint . --fix` to apply
lint fixes and formatting, or `pnpm format` to format all supported file types.

The frontend extends `tsconfig.base.json` and discovers the root ESLint, Stylelint, and Prettier
configs automatically. Its format scripts explicitly reuse the root `.prettierignore`.

Run `pnpm --filter front-admin-panel check` to check only the frontend, or `pnpm check` for the
whole repository. Next.js route types are generated before linting and type-checking, so these
commands also work before starting the development server. New Next.js apps should provide a
`typegen` script (`next typegen`) for the root lint command to discover.
