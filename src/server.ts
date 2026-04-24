import "dotenv/config";
import express, { type Express } from "express";
import { SERVER_PORT } from "@config";
import { buildRouter } from "./router.js";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { RedisConnector } from "@lib/integration/redis/redisConnector.js";
import { logMessage } from "@lib/logging/logger.js";
import { prisma } from "@gcforms/database";

const server: Express = express();

server.use("/", buildRouter());

server.listen(SERVER_PORT, () => {
  // Load some resources in advance to speed up the API execution later on
  getApiAuditLogSqsQueueUrl();
  RedisConnector.getInstance();
  prisma.$queryRaw`SELECT 1`.catch(() => {
    throw new Error(
      "[server] API server failed to start: database connection could not be established. Ensure the database is running and the connection configuration is correct",
    );
  });

  logMessage.info(`[server] API server listening on port ${SERVER_PORT}`);
});
