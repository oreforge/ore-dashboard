FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock .npmrc ./
RUN --mount=type=secret,id=GITHUB_TOKEN \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/GITHUB_TOKEN)" >> .npmrc && \
    bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/.output .output
ENTRYPOINT ["sh", "-c", "\
  NUXT_ORE_API_URL=${NUXT_ORE_API_URL:-$ORE_API_URL} \
  NUXT_ORE_TOKEN=${NUXT_ORE_TOKEN:-$ORE_TOKEN} \
  exec node .output/server/index.mjs"]
