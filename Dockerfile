ARG NODE_VERSION=22.5.1-alpine3.19@sha256:17e6738cb7ac3d65860d51533372dad098c00d15bdfdb0b5f3897824eb9e11a5
ARG YARN_VERSION=4.3.1

FROM node:$NODE_VERSION AS build
ARG YARN_VERSION
ENV NODE_ENV=production

WORKDIR /src
COPY . .

RUN corepack enable &&\
    yarn set version $YARN_VERSION &&\
    yarn install --immutable

FROM node:$NODE_VERSION AS final
ARG YARN_VERSION
ENV NODE_ENV=production

WORKDIR /src

COPY --from=build /src/node_modules ./node_modules
COPY server.js app.js package.json yarn.lock .yarnrc.yml ./
COPY api ./api

RUN corepack enable &&\ 
    yarn set version $YARN_VERSION

EXPOSE 3001

ENTRYPOINT ["yarn", "start"]
