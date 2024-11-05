import { vi, describe, it, expect } from "vitest";
import { getTokenBucketRateLimiterAssociatedToForm } from "@lib/rateLimiting/tokenBucketProvider.js";
import { getValueFromRedis } from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";

vi.mock("@lib/integration/redis/redisClientAdapter");
const getValueFromRedisMock = vi.mocked(getValueFromRedis);

describe("tokenBucketProvider should", () => {
  it("return high capacity token bucket if form has high API rate limits", async () => {
    getValueFromRedisMock.mockResolvedValueOnce("high");

    const tokenBucketRateLimiter =
      await getTokenBucketRateLimiterAssociatedToForm(
        "clzsn6tao000611j50dexeob0",
      );

    expect(tokenBucketRateLimiter.keyPrefix).toEqual(
      "high-capacity-token-bucket",
    );

    /**
     * Not using the token bucket configuration variables (from @config) for the comparison below
     * to make sure we have a way to catch any unintentional API rate limit config change.
     */
    expect(tokenBucketRateLimiter.points).toEqual(1000);
    expect(tokenBucketRateLimiter.duration).toEqual(60);
  });

  it("return low capacity token bucket if form does not have high API rate limits", async () => {
    getValueFromRedisMock.mockResolvedValueOnce(undefined);

    const tokenBucketRateLimiter =
      await getTokenBucketRateLimiterAssociatedToForm(
        "clzsn6tao000611j50dexeob0",
      );

    expect(tokenBucketRateLimiter.keyPrefix).toEqual(
      "low-capacity-token-bucket",
    );

    /**
     * Not using the token bucket configuration variables (from @config) for the comparison below
     * to make sure we have a way to catch any unintentional API rate limit config change.
     */
    expect(tokenBucketRateLimiter.points).toEqual(500);
    expect(tokenBucketRateLimiter.duration).toEqual(60);
  });

  it("return low capacity token bucket if we fail to determine what API rate limits the form has access to", async () => {
    const customError = new Error("custom error");
    getValueFromRedisMock.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "warn");

    const tokenBucketRateLimiter =
      await getTokenBucketRateLimiterAssociatedToForm(
        "clzsn6tao000611j50dexeob0",
      );

    expect(tokenBucketRateLimiter.keyPrefix).toEqual(
      "low-capacity-token-bucket",
    );
    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      "[token-bucket-provider] Failed to retrieve token bucket capacity for form clzsn6tao000611j50dexeob0. Will use low capacity bucket by default",
    );
  });
});
