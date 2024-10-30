import { vi, describe, it, expect } from "vitest";
import { getTokenBucketAssociatedToForm } from "@lib/rateLimiting/tokenBucketProvider.js";
import { getValueFromRedis } from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";

vi.mock("@lib/integration/redis/redisClientAdapter");
const getValueFromRedisMock = vi.mocked(getValueFromRedis);

describe("tokenBucketProvider should", () => {
  it("return high capacity token bucket if form has high API rate limits", async () => {
    getValueFromRedisMock.mockResolvedValueOnce("high");

    const tokenBucket = await getTokenBucketAssociatedToForm(
      "clzsn6tao000611j50dexeob0",
    );

    expect(tokenBucket.keyPrefix).toEqual("high-capacity-token-bucket");

    // Not using the config variable here for the comparison to make sure we have a way to catch a possible unintentional API rate limit config change
    expect(tokenBucket.points).toEqual(1000);
    expect(tokenBucket.duration).toEqual(60);
  });

  it("return low capacity token bucket if form does not have high API rate limits", async () => {
    getValueFromRedisMock.mockResolvedValueOnce(undefined);

    const tokenBucket = await getTokenBucketAssociatedToForm(
      "clzsn6tao000611j50dexeob0",
    );

    expect(tokenBucket.keyPrefix).toEqual("low-capacity-token-bucket");

    // Not using the config variable here for the comparison to make sure we have a way to catch a possible unintentional API rate limit config change
    expect(tokenBucket.points).toEqual(500);
    expect(tokenBucket.duration).toEqual(60);
  });

  it("return low capacity token bucket if we fail to determine what API rate limits the form has access to", async () => {
    const customError = new Error("custom error");
    getValueFromRedisMock.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "warn");

    const tokenBucket = await getTokenBucketAssociatedToForm(
      "clzsn6tao000611j50dexeob0",
    );

    expect(tokenBucket.keyPrefix).toEqual("low-capacity-token-bucket");
    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      "[token-bucket-provider] Failed to retrieve token bucket capacity for form clzsn6tao000611j50dexeob0",
    );
  });
});
