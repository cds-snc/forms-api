FROM node:22.5.1-alpine3.19@sha256:17e6738cb7ac3d65860d51533372dad098c00d15bdfdb0b5f3897824eb9e11a5
ENV NODE_ENV=production

# Create and change to the app directory.
WORKDIR /src

COPY yarn.lock package.json ./

# Install production dependencies.
RUN yarn install

# Copy local code to the container image.
COPY . .

EXPOSE 3001

ENTRYPOINT ["yarn", "start"]