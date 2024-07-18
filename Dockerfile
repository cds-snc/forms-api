FROM node:21-alpine3.19
ENV NODE_ENV=production

# Create and change to the app directory.
WORKDIR /src

COPY yarn.lock package.json ./

# Install production dependencies.
RUN yarn install

# Copy local code to the container image.
COPY . .

EXPOSE 3000

ENTRYPOINT [ "yarn", "start"]