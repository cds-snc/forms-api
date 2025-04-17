import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { checkServiceHealthOperation } from "@operations/checkServiceHealth.js";
import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { RedisConnector } from "@lib/integration/redis/redisConnector.js";
import { logMessage } from "@lib/logging/logger.js";
import axios from "axios";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

vi.mock("@lib/integration/redis/redisConnector");
const redisConnectorMock = vi.mocked(RedisConnector);

// biome-ignore lint/suspicious/noExplicitAny: we need to assign the Redis client and allow mock resolved values
const redisClient: any = {
  ping: vi.fn(),
};

redisConnectorMock.getInstance.mockResolvedValue({ client: redisClient });

const logMessageSpy = vi.spyOn(logMessage, "info");

describe("checkServiceHealthOperation handler should", () => {
  const requestMock = getMockReq();
  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();
    dynamoDbMock.reset();
  });

  it("respond with success if all internal services are healthy", async () => {
    dynamoDbMock.on(ScanCommand).resolvesOnce({ Items: [] });
    redisClient.ping.mockResolvedValueOnce("PONG");
    vi.spyOn(DatabaseConnectorClient, "query").mockResolvedValueOnce(1);
    vi.spyOn(axios, "get").mockResolvedValueOnce({});

    await checkServiceHealthOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      "[service-health] dynamodb => healthy | redis => healthy | postgresql => healthy | zitadel => healthy",
    );
    expect(responseMock.json).toHaveBeenCalledWith({ status: "healthy" });
  });

  it("respond with error if DynamoDB service is unhealthy", async () => {
    dynamoDbMock.on(ScanCommand).rejectsOnce(new Error("custom error"));
    redisClient.ping.mockResolvedValueOnce("PONG");
    vi.spyOn(DatabaseConnectorClient, "query").mockResolvedValueOnce(1);
    vi.spyOn(axios, "get").mockResolvedValueOnce({});

    await checkServiceHealthOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      "[service-health] dynamodb => unhealthy | redis => healthy | postgresql => healthy | zitadel => healthy",
    );
    expect(responseMock.sendStatus).toHaveBeenCalledWith(503);
  });

  it("respond with error if Redis service is unhealthy", async () => {
    dynamoDbMock.on(ScanCommand).resolvesOnce({ Items: [] });
    redisClient.ping.mockRejectedValueOnce(new Error("custom error"));
    vi.spyOn(DatabaseConnectorClient, "query").mockResolvedValueOnce(1);
    vi.spyOn(axios, "get").mockResolvedValueOnce({});

    await checkServiceHealthOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      "[service-health] dynamodb => healthy | redis => unhealthy | postgresql => healthy | zitadel => healthy",
    );
    expect(responseMock.sendStatus).toHaveBeenCalledWith(503);
  });

  it("respond with error if PostgreSQL service is unhealthy", async () => {
    dynamoDbMock.on(ScanCommand).resolvesOnce({ Items: [] });
    redisClient.ping.mockResolvedValueOnce("PONG");
    vi.spyOn(DatabaseConnectorClient, "query").mockRejectedValueOnce(
      new Error("custom error"),
    );
    vi.spyOn(axios, "get").mockResolvedValueOnce({});

    await checkServiceHealthOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      "[service-health] dynamodb => healthy | redis => healthy | postgresql => unhealthy | zitadel => healthy",
    );
    expect(responseMock.sendStatus).toHaveBeenCalledWith(503);
  });

  it("respond with error if Zitadel service is unhealthy", async () => {
    dynamoDbMock.on(ScanCommand).resolvesOnce({ Items: [] });
    redisClient.ping.mockResolvedValueOnce("PONG");
    vi.spyOn(DatabaseConnectorClient, "query").mockResolvedValueOnce(1);
    vi.spyOn(axios, "get").mockRejectedValueOnce(new Error("custom error"));

    await checkServiceHealthOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      "[service-health] dynamodb => healthy | redis => healthy | postgresql => healthy | zitadel => unhealthy",
    );
    expect(responseMock.sendStatus).toHaveBeenCalledWith(503);
  });
});
