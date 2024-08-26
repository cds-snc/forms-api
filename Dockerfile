ARG NODE_VERSION=22.5.1-alpine3.19@sha256:17e6738cb7ac3d65860d51533372dad098c00d15bdfdb0b5f3897824eb9e11a5
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

ARG ENVIRONMENT_MODE
ENV ENVIRONMENT_MODE=$ENVIRONMENT_MODE

EXPOSE 3001

ENTRYPOINT ["pnpm", "start"]