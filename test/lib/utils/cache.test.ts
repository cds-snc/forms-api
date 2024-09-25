import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedisConnector } from "@lib/integration/redisConnector.js";
import { getValueFromCache, cacheValue } from "@lib/utils/cache.js";

vi.mock("@lib/integration/redisConnector");
const redisConnectorMock = vi.mocked(RedisConnector);

// biome-ignore lint/suspicious/noExplicitAny: we need to assign the Redis client and allow mock resolved values
const redisClient: any = {
  get: vi.fn(),
  set: vi.fn(),
};

redisConnectorMock.getInstance.mockResolvedValue({ client: redisClient });

describe("cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getValueFromCache should", () => {
    it("return value from cache if the provided key exist", async () => {
      redisClient.get.mockResolvedValue("key");

      const result = await getValueFromCache("key");

      expect(result).toEqual("key");
      expect(redisClient.get).toHaveBeenCalledWith("key");
    });

    it("return undefined if the provided key does not exist", async () => {
      redisClient.get.mockResolvedValue(null);

      const result = await getValueFromCache("key");

      expect(result).toBeUndefined();
      expect(redisClient.get).toHaveBeenCalledWith("key");
    });
  });

  describe("cacheValue should", () => {
    it("set the cache correctly", async () => {
      await cacheValue("key", "value");

      expect(redisClient.set).toHaveBeenCalledWith("key", "value", {});
    });

    it("set the cache correctly with expiry date if provided", async () => {
      await cacheValue("key", "value", 10);

      expect(redisClient.set).toHaveBeenCalledWith("key", "value", { EX: 10 });
    });
  });
});
