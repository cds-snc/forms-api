ARG NODE_VERSION=22.22.3-alpine3.23@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920
ARG PNPM_VERSION=11.8.0+sha512.c1f5e7c4cb241c8f174b743851d82f42b802324afc8b0f116b96adb15aa06664948dde36960a3ba1079ba5b4b29dd0140135b94b5b5f5263592249d68e555f26

FROM node:$NODE_VERSION AS build
ARG PNPM_VERSION

WORKDIR /src

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm i -g corepack@latest &&\
    corepack enable pnpm &&\
    corepack use pnpm@$PNPM_VERSION &&\
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:$NODE_VERSION AS final
ARG PNPM_VERSION
ENV NODE_ENV=production

WORKDIR /src

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/build ./build

RUN npm i -g corepack@latest &&\
    corepack enable pnpm &&\
    corepack use pnpm@$PNPM_VERSION

EXPOSE 3001

ENTRYPOINT ["pnpm", "start"]