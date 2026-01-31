ARG NODE_VERSION=22.22.0-alpine3.23@sha256:e4bf2a82ad0a4037d28035ae71529873c069b13eb0455466ae0bc13363826e34
ARG PNPM_VERSION=10.25.0

FROM node:$NODE_VERSION AS build
ARG PNPM_VERSION

WORKDIR /src

COPY package.json pnpm-lock.yaml ./

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

COPY package.json pnpm-lock.yaml ./
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/build ./build

RUN npm i -g corepack@latest &&\
    corepack enable pnpm &&\
    corepack use pnpm@$PNPM_VERSION

EXPOSE 3001

ENTRYPOINT ["pnpm", "start"]