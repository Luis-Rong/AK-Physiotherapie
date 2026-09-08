# syntax=docker/dockerfile:1.7
# Build-Kontext ist das Repo-Root (pnpm-Workspace), siehe compose.*.yml.

FROM node:24-alpine AS base
RUN corepack enable pnpm
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/reha/package.json apps/reha/
COPY packages/ui/package.json packages/ui/
COPY packages/testdata/package.json packages/testdata/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages ./packages
COPY apps/reha ./apps/reha
# db/client.ts baut den Verbindungspool beim Modul-Import auf und wirft ohne DATABASE_URL;
# next build importiert Routen wie /api/assets/[id] zum Sammeln der Seiten-Daten, auch ohne
# echte Datenbank. Platzhalter wie in ci.yml, werden zur Laufzeit von compose.*.yml überschrieben.
ENV DATABASE_URL=postgres://x:x@127.0.0.1:1/x \
    BETTER_AUTH_SECRET=docker-build-only-not-for-production-000000
RUN pnpm --filter reha build

# Laufzeit: nur das Standalone-Bundle, kein pnpm, keine Dev-Abhängigkeiten
FROM node:24-alpine AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S reha && adduser -S reha -G reha && mkdir -p /data/uploads && chown -R reha:reha /data
WORKDIR /app
COPY --from=build --chown=reha:reha /repo/apps/reha/.next/standalone ./
COPY --from=build --chown=reha:reha /repo/apps/reha/.next/static ./apps/reha/.next/static
COPY --from=build --chown=reha:reha /repo/apps/reha/public ./apps/reha/public
# Migrationen und Skripte für den Einmal-Container
COPY --from=build --chown=reha:reha /repo/apps/reha/src/db/migrations ./migrations
COPY --chown=reha:reha apps/reha/docker/migrate.mjs ./migrate.mjs
USER reha
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/login >/dev/null || exit 1
CMD ["node", "apps/reha/server.js"]
