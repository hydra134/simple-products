# simple-products

TypeScript monorepo powered by pnpm and Turborepo.

## Fastify API

Run `pnpm --filter api dev` to start the API at `http://127.0.0.1:3001`.
Run `pnpm --filter api check` for formatting, linting, type-checking, and tests.
For production, run `pnpm --filter api build` followed by `pnpm --filter api start`.
The API extends the root TypeScript config with NodeNext settings and reuses root lint/format
configs. See `apps/api/README.md` for routes and environment settings.

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
- `pnpm check` — run all static checks

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
