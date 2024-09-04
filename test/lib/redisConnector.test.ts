import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { type RedisClientType, createClient } from "redis";
import { RedisConnector } from "@src/lib/redisConnector";

vi.mock("redis", () => {
  const client = {
    connect: vi.fn(),
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

  it("create a Redis client instance", async () => {
    const instance = await RedisConnector.getInstance();
    expect(instance).toBeInstanceOf(RedisConnector);
    expect(redisClientMock.connect).toHaveBeenCalledOnce();
  });

  it("not call connect after creation", async () => {
    const instance = await RedisConnector.getInstance();
    expect(instance).toBeInstanceOf(RedisConnector);
    expect(redisClientMock.connect).toHaveBeenCalledTimes(0);
  });
});
