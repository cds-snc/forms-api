ARG NODE_VERSION=22.9.0-alpine3.19@sha256:83b4d7bcfc3d4a40faac3e73a59bc3b0f4b3cc72b9a19e036d340746ebfeaecb
ARG PNPM_VERSION=9.6.0

FROM node:$NODE_VERSION AS build
ARG PNPM_VERSION

WORKDIR /src

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm &&\
    corepack use pnpm@$PNPM_VERSION &&\
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:$NODE_VERSION AS final
ARG PNPM_VERSION
ENV NODE_ENV=production

WORKDIR /src

COPY package.json pnpm-lock.yaml ./
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/build ./build

RUN corepack enable pnpm &&\
    corepack use pnpm@$PNPM_VERSION

EXPOSE 3001

ENTRYPOINT ["pnpm", "start"]