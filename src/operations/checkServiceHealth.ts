import type { NextFunction, Request, Response } from "express";
import type { ApiOperation } from "@operations/types/operation.js";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { RedisConnector } from "@lib/integration/redis/redisConnector.js";
import { logMessage } from "@lib/logging/logger.js";
import { ZITADEL_DOMAIN } from "@config";
import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import axios from "axios";

type ServiceHealthCheckResult = {
  service: "dynamodb" | "redis" | "postgresql" | "zitadel";
  isHealthy: boolean;
};

async function main(
  _: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const serviceHealthCheckResults = await Promise.all([
      checkDynamoDbServiceHealth(),
      checkRedisServiceHealth(),
      checkPostgreSqlServiceHealth(),
      checkZitadelServiceHealth(),
    ]);

    logMessage.info(
      `[service-health] ${serviceHealthCheckResults.map((r) => `${r.service} => ${r.isHealthy ? "healthy" : "unhealthy"}`).join(" | ")}`,
    );

    if (serviceHealthCheckResults.some((r) => r.isHealthy === false)) {
      response.sendStatus(503);
      return;
    }

    response.json({
      status: "healthy",
    });
  } catch (error) {
    next(
      new Error("[operation] Internal error while checking service health", {
        cause: error,
      }),
    );
  }
}

function checkDynamoDbServiceHealth(): Promise<ServiceHealthCheckResult> {
  return AwsServicesConnector.getInstance()
    .dynamodbClient.send(
      new ScanCommand({
        TableName: "Vault",
        Limit: 1,
      }),
    )
    .then(
      () => true,
      () => false,
    )
    .then((isHealthy) => ({ service: "dynamodb", isHealthy }));
}

function checkRedisServiceHealth(): Promise<ServiceHealthCheckResult> {
  return RedisConnector.getInstance()
    .then((redisConnector) => redisConnector.client.ping())
    .then(
      () => true,
      () => false,
    )
    .then((isHealthy) => ({ service: "redis", isHealthy }));
}

function checkPostgreSqlServiceHealth(): Promise<ServiceHealthCheckResult> {
  return DatabaseConnectorClient.query("SELECT 1")
    .then(
      () => true,
      () => false,
    )
    .then((isHealthy) => ({ service: "postgresql", isHealthy }));
}

function checkZitadelServiceHealth(): Promise<ServiceHealthCheckResult> {
  return axios
    .get(`${ZITADEL_DOMAIN}/debug/ready`, { timeout: 5000 })
    .then(
      () => true, // Zitadel answered with HTTP status 200
      () => false, // Zitadel answered with HTTP status 412
    )
    .then((isHealthy) => ({ service: "zitadel", isHealthy }));
}

export const checkServiceHealthOperation: ApiOperation = {
  middleware: [],
  handler: main,
};
