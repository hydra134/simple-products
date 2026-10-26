ARG NODE_IMAGE

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install --global pnpm@12.15.0
WORKDIR /workspace

FROM base AS build
COPY . .
RUN CI=true pnpm install --frozen-lockfile
RUN pnpm --filter front-admin-panel build

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /workspace
COPY --from=build --chown=node:node /workspace/apps/front-admin-panel/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/front-admin-panel/.next/static ./apps/front-admin-panel/.next/static
COPY --from=build --chown=node:node /workspace/apps/front-admin-panel/public ./apps/front-admin-panel/public
USER node
EXPOSE 3000
CMD ["node", "apps/front-admin-panel/server.js"]
