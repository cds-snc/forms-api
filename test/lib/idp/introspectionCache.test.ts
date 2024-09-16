import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RedisConnector } from "@src/lib/connectors/redisConnector.js";
import {
  getIntrospectionCache,
  setIntrospectionCache,
} from "@src/lib/idp/introspectionCache.js";
import type { IntrospectionResult } from "@lib/idp/introspectToken.js";

vi.mock("@src/lib/connectors/redisConnector");
const redisConnectorMock = vi.mocked(RedisConnector);

describe("introspectionCache", () => {
  // biome-ignore lint/suspicious/noExplicitAny: we need to assign the Redis client and allow mock resolved values
  const redisClient: any = {
    get: vi.fn(),
    set: vi.fn(),
  };
  const authTokenCacheKey =
    "api:auth:RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=";

  beforeEach(() => {
    redisConnectorMock.getInstance.mockResolvedValue({ client: redisClient });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getIntrospectionCache should", () => {
    it("return the parsed introspection result if the cache is found", async () => {
      const accessToken = "testAccessToken";
      const introspectionResult: IntrospectionResult = {
        serviceUserId: "Frodo",
        exp: 1234567890,
        serviceAccountId: "11111111111111",
      };
      redisClient.get.mockResolvedValue(JSON.stringify(introspectionResult));

      const result = await getIntrospectionCache(accessToken);
      expect(result).toEqual(introspectionResult);
      expect(redisClient.get).toHaveBeenCalledWith(authTokenCacheKey);
    });

    it("return undefined if the cache is not found", async () => {
      const accessToken = "testAccessToken";
      redisClient.get.mockResolvedValue(null);

      const result = await getIntrospectionCache(accessToken);
      expect(result).toBeUndefined();
      expect(redisClient.get).toHaveBeenCalledWith(authTokenCacheKey);
    });
  });

  describe("setIntrospectionCache should", () => {
    it("set the cache correctly in Redis", async () => {
      const accessToken = "testAccessToken";
      const introspectionResult: IntrospectionResult = {
        serviceUserId: "Frodo",
        exp: 1234567890,
        serviceAccountId: "11111111111111",
      };

      await setIntrospectionCache(accessToken, introspectionResult);
      expect(redisClient.set).toHaveBeenCalledWith(
        authTokenCacheKey,
        JSON.stringify(introspectionResult),
        { EX: 300 },
      );
    });
  });
});
