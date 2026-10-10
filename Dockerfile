ARG NODE_VERSION=22.23.3-alpine3.23@sha256:baf676f7d0e552f3231945c2f979055ca121bce128c152f7a34e6bd1728b1c5a
ARG PNPM_VERSION=11.26.0+sha512.fc0e2bf890b9f983611f1ab68c0637bce914390653699f83c1a78b005ed25f2c81e77920c8fd8eee2ecf0b58b28cdcb00a84d97f69bcf7c56b2f344710238664

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