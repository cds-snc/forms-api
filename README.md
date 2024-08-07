# GC Forms API

Machine-to-machine interface for downloading form submissions.

## To run locally in development mode

```sh
pnpm install & pnpm dev
```

## To run locally in production mode

```sh
pnpm install & pnpm build & pnpm start
```

## With docker

```sh
docker build -t forms-api .
docker run -p 3001:3001 forms-api
```
