import "dotenv/config";
import express, { type Express } from "express";
import { SERVER_PORT } from "@src/config.js";
import { buildRouter } from "@src/router.js";
import { logMessage } from "@lib/logging/logger.js";

const server: Express = express();

server.use("/", buildRouter());

server.listen(SERVER_PORT, () => {
  logMessage.info(
    `[express-server] API server listening on port ${SERVER_PORT}`,
  );
});
