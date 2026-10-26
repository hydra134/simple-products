ARG NODE_IMAGE

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install --global pnpm@12.15.0
WORKDIR /workspace

FROM base AS build
COPY . .
RUN CI=true pnpm install --frozen-lockfile
RUN pnpm --filter backend-admin-panel build

FROM base AS production-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend-admin-panel/package.json apps/backend-admin-panel/package.json
COPY apps/front-admin-panel/package.json apps/front-admin-panel/package.json
RUN CI=true pnpm install --prod --filter backend-admin-panel --frozen-lockfile

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production
WORKDIR /workspace
COPY --from=production-dependencies --chown=node:node /workspace/node_modules ./node_modules
COPY --from=production-dependencies --chown=node:node /workspace/apps/backend-admin-panel/node_modules ./apps/backend-admin-panel/node_modules
COPY --from=production-dependencies --chown=node:node /workspace/apps/backend-admin-panel/package.json ./apps/backend-admin-panel/package.json
COPY --from=build --chown=node:node /workspace/apps/backend-admin-panel/dist ./apps/backend-admin-panel/dist
WORKDIR /workspace/apps/backend-admin-panel
USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]
