# You should follow the instructions in the monorepo root before building this container
# This file should be triggered inside the project's root (which is ./bots/discord)
FROM oven/bun:latest AS base

FROM base AS build

WORKDIR /build
COPY . .
RUN cd bots/discord && bun run build

FROM base AS release

WORKDIR /app
COPY --from=build /build/bots/discord/dist /app

USER 1000:1000

ENTRYPOINT [ "bun", "run", "src/index.js" ]
