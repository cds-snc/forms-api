import express, { type Express } from "express";
import { SERVER_PORT } from "@src/config.js";
import { router } from "@src/router.js";

const server: Express = express();

server.use("/", router);

server.listen(SERVER_PORT, () => {
  console.info(`>>> API server listening on port ${SERVER_PORT} <<<`);
});
