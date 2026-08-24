# simple-products

TypeScript monorepo powered by pnpm and Turborepo.

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
