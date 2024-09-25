import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { type RedisClientType, createClient } from "redis";
import { RedisConnector } from "@lib/integration/redisConnector.js";

vi.mock("redis", () => {
  const client = {
    connect: vi.fn().mockResolvedValue({}),
    quit: vi.fn(),
    on: vi.fn().mockReturnThis(),
  };
  return {
    createClient: vi.fn(() => client),
  };
});

describe("RedisConnector should", () => {
  let redisClientMock: RedisClientType;

  beforeEach(() => {
    redisClientMock = createClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("create a Redis client instance once", async () => {
    await RedisConnector.getInstance();
    await RedisConnector.getInstance();

    expect(redisClientMock.connect).toHaveBeenCalledOnce();
  });
});
