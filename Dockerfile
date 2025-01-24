FROM imbios/bun-node:latest-current-slim AS base

WORKDIR /usr/src/app
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get -y update && \
  apt-get install -yq openssl git ca-certificates tzdata && \
  ln -fs /usr/share/zoneinfo/Asia/Makassar /etc/localtime && \
  dpkg-reconfigure -f noninteractive tzdata

# ---------------------------------------------------------------------------- #

FROM base AS install

WORKDIR /temp/dev
COPY package.json tsconfig.json ./
COPY bun.lock* ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile
RUN bun run db:generate

# verify node_modules/.prisma exists
RUN test -d node_modules/.prisma

WORKDIR /temp/prod
COPY package.json tsconfig.json ./
COPY bun.lock* ./
COPY prisma ./prisma/
# COPY /temp/dev/node_modules/.prisma ./node_modules/.prisma/

RUN bun install --frozen-lockfile --production

# ---------------------------------------------------------------------------- #

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun test

# ---------------------------------------------------------------------------- #

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/dev/node_modules/.prisma node_modules/.prisma
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/tsconfig.json .
COPY --from=prerelease /usr/src/app/src src

ENV PORT=3000
ENV NAME="Enterprise Asset Management API"
ENV DESCRIPTION="API for managing enterprise assets."

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ]

