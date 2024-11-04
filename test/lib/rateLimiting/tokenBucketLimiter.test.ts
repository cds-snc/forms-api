import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  consumeTokenIfAvailable,
  refundConsumedToken,
} from "@lib/rateLimiting/tokenBucketLimiter.js";
import { getTokenBucketRateLimiterAssociatedToForm } from "@lib/rateLimiting/tokenBucketProvider.js";

vi.mock("@lib/rateLimiting/tokenBucketProvider");
const getTokenBucketRateLimiterAssociatedToFormMock = vi.mocked(
  getTokenBucketRateLimiterAssociatedToForm,
);

describe("tokenBucketLimiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("consumeTokenIfAvailable should", () => {
    it("return confirmation that a token was consumed if some were available", async () => {
      getTokenBucketRateLimiterAssociatedToFormMock.mockResolvedValueOnce({
        points: 10,
        consume: vi.fn().mockResolvedValueOnce({
          remainingPoints: 5,
          msBeforeNext: 2000,
          consumedPoints: 5,
        }),
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any);

      const consumeTokenResult = await consumeTokenIfAvailable(
        "clzsn6tao000611j50dexeob0",
      );

      expect(consumeTokenResult).toEqual({
        wasAbleToConsumeToken: true,
        bucketStatus: {
          bucketCapacity: 10,
          numberOfMillisecondsBeforeRefill: 2000,
          remainingTokens: 5,
        },
      });
    });

    it("return confirmation that no token was consumed because none were available", async () => {
      getTokenBucketRateLimiterAssociatedToFormMock.mockResolvedValueOnce({
        points: 10,
        consume: vi.fn().mockRejectedValueOnce({
          remainingPoints: 5,
          msBeforeNext: 2000,
          consumedPoints: 5,
        }),
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any);

      const consumeTokenResult = await consumeTokenIfAvailable(
        "clzsn6tao000611j50dexeob0",
      );

      expect(consumeTokenResult).toEqual({
        wasAbleToConsumeToken: false,
        bucketStatus: {
          bucketCapacity: 10,
          numberOfMillisecondsBeforeRefill: 2000,
          remainingTokens: 5,
        },
      });
    });
  });

  describe("refundConsumedToken should", () => {
    it("successfully refund a token if everything goes well", async () => {
      getTokenBucketRateLimiterAssociatedToFormMock.mockResolvedValueOnce({
        points: 10,
        reward: vi.fn().mockResolvedValueOnce({
          remainingPoints: 5,
          msBeforeNext: 2000,
          consumedPoints: 5,
        }),
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any);

      await expect(
        refundConsumedToken("clzsn6tao000611j50dexeob0"),
      ).resolves.not.toThrow();
    });
  });
});
