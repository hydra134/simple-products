# API

Fastify service generated from the official starter, adapted for this pnpm workspace.
Requires Node.js 24 or newer. Uses root ESLint/Prettier and the shared TypeScript catalog.

From the repository root:

```sh
pnpm --filter api dev
pnpm --filter api check
pnpm --filter api build
pnpm --filter api start
```

The server defaults to `http://127.0.0.1:3001`. Set `PORT` and `HOST` to override;
use `HOST=0.0.0.0` when running in a container. `start` runs the compiled build.

- `GET /` returns `{ "root": true }`.
- `GET /example` returns the starter's example response.
- Plugins and routes are discovered automatically under `src/plugins` and `src/routes`.
- Tests run with Node's test runner through `tsx` without opening a port.

`tsconfig.json` includes source and tests for type-checking and ESLint.
`tsconfig.build.json` emits only source to `dist` using NodeNext ESM resolution.
