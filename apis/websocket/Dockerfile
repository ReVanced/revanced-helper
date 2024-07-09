FROM oven/bun:latest AS base

FROM base AS build

WORKDIR /build
COPY . .
RUN bun install && bun run build:packages && cd apis/websocket && bun run build

FROM base AS release

WORKDIR /app
COPY --from=build /build/apis/websocket/dist /app
USER 1000:1000

ENTRYPOINT [ "bun", "run", "index.js" ]
