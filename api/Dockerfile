# API + built web UI. Built by deploy.d/docker-compose.yml (see ../deploy).

FROM node:22-bookworm-slim AS build
WORKDIR /home/sar/api

# Install dependencies in their own layers so source edits don't re-run npm ci
COPY package.json package-lock.json ./
RUN npm ci
COPY web/package.json web/package-lock.json web/.npmrc ./web/
RUN npm ci --prefix web

COPY . .
RUN npm run build \
    && npm run build --prefix web \
    && npm prune --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /home/sar/api

COPY --from=build /home/sar/api/node_modules ./node_modules
# dist/ carries package.json, migrations/ and lib/user.webp (see "npm run build")
COPY --from=build /home/sar/api/dist ./dist
COPY --from=build /home/sar/api/web/dist ./web/dist
# lib/report.ts reads web/public/logo.png from source-relative paths
COPY --from=build /home/sar/api/web/public ./web/public

USER node
EXPOSE 4999
CMD ["node", "dist/index.js", "--heartbeat"]
