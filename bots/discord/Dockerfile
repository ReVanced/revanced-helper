# This file should be triggered from the monorepo root
FROM node:latest AS base

# Install Bun
RUN apt-get update && apt-get install -y curl unzip
RUN curl -fsSL https://bun.sh/install.sh | bash
ENV PATH="/root/.bun/bin:$PATH"

FROM base AS build

WORKDIR /build
COPY . .
RUN bun install --frozen-lockfile
RUN cd bots/discord && bun run build

FROM base AS release

WORKDIR /app
COPY --from=build /build/bots/discord/dist /app

USER 1000:1000

ENTRYPOINT [ "bun", "run", "src/index.js" ]
