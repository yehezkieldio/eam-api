FROM imbios/bun-node:latest-current-slim AS base

RUN groupadd -r appuser && useradd -r -g appuser appuser

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

ARG GIT_COMMIT
ARG BUILD_DATE

# Define default environment variables
ENV PORT=3000
ENV NAME="Enterprise Asset Management API"
ENV DESCRIPTION="API for managing enterprise assets."
ENV GIT_COMMIT_HASH=""
ENV BUILD_TIMESTAMP=""

RUN git rev-parse --short=10 HEAD > /tmp/commit_hash && \
    echo $(date -u +'%Y-%m-%dT%H:%M:%SZ') > /tmp/build_date && \
    export GIT_COMMIT_HASH=$(cat /tmp/commit_hash) && \
    export BUILD_TIMESTAMP=$(cat /tmp/build_date) && \
    rm /tmp/commit_hash /tmp/build_date

USER appuser

EXPOSE ${PORT}

ENTRYPOINT [ "bun", "run", "start" ]

