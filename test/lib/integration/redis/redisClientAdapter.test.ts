import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedisConnector } from "@lib/integration/redis/redisConnector.js";
import {
  getValueFromRedis,
  setValueInRedis,
} from "@lib/integration/redis/redisClientAdapter.js";

vi.mock("@lib/integration/redis/redisConnector");
const redisConnectorMock = vi.mocked(RedisConnector);

// biome-ignore lint/suspicious/noExplicitAny: we need to assign the Redis client and allow mock resolved values
const redisClient: any = {
  get: vi.fn(),
  set: vi.fn(),
};

redisConnectorMock.getInstance.mockResolvedValue({ client: redisClient });

describe("redisClientAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getValueFromRedis should", () => {
    it("return value from Redis if the provided key exist", async () => {
      redisClient.get.mockResolvedValueOnce("key");

      const result = await getValueFromRedis("key");

      expect(result).toEqual("key");
      expect(redisClient.get).toHaveBeenCalledWith("key");
    });

    it("return undefined if the provided key does not exist", async () => {
      redisClient.get.mockResolvedValueOnce(null);

      const result = await getValueFromRedis("key");

      expect(result).toBeUndefined();
      expect(redisClient.get).toHaveBeenCalledWith("key");
    });
  });

  describe("setValueInRedis should", () => {
    it("correctly set the value in Redis", async () => {
      await setValueInRedis("key", "value");

      expect(redisClient.set).toHaveBeenCalledWith("key", "value", {});
    });

    it("correctly set the value in Redis with expiry date if provided", async () => {
      await setValueInRedis("key", "value", 10);

      expect(redisClient.set).toHaveBeenCalledWith("key", "value", { EX: 10 });
    });
  });
});
