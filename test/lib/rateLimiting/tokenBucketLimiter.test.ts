import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  consumeTokenIfAvailable,
  refundConsumedToken,
} from "@lib/rateLimiting/tokenBucketLimiter.js";
import { getTokenBucketAssociatedToForm } from "@lib/rateLimiting/tokenBucketProvider.js";
import { logMessage } from "@lib/logging/logger.js";

vi.mock("@lib/rateLimiting/tokenBucketProvider");
const getTokenBucketAssociatedToFormMock = vi.mocked(
  getTokenBucketAssociatedToForm,
);

describe("tokenBucketLimiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("consumeTokenIfAvailable should", () => {
    it("return confirmation that a token was consumed if some were available", async () => {
      getTokenBucketAssociatedToFormMock.mockResolvedValueOnce({
        points: 10,
        consume: vi.fn().mockResolvedValueOnce({
          remainingPoints: 5,
          msBeforeNext: 2000,
          consumedPoints: 5,
        }),
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any);

      const tokenConsumptionResult = await consumeTokenIfAvailable(
        "clzsn6tao000611j50dexeob0",
      );

      expect(tokenConsumptionResult).toEqual({
        wasAbleToConsumeToken: true,
        bucketStatus: {
          bucketCapacity: 10,
          numberOfMillisecondsBeforeRefill: 2000,
          remainingTokens: 5,
        },
      });
    });

    it("return confirmation that no token was consumed because none were available", async () => {
      getTokenBucketAssociatedToFormMock.mockResolvedValueOnce({
        points: 10,
        consume: vi.fn().mockRejectedValueOnce({
          remainingPoints: 5,
          msBeforeNext: 2000,
          consumedPoints: 5,
        }),
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any);

      const tokenConsumptionResult = await consumeTokenIfAvailable(
        "clzsn6tao000611j50dexeob0",
      );

      expect(tokenConsumptionResult).toEqual({
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
      getTokenBucketAssociatedToFormMock.mockResolvedValueOnce({
        points: 10,
        consume: vi.fn().mockResolvedValueOnce({
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

    it("log a warning the token refund process failed because of an internal error", async () => {
      const customError = new Error("custom error");
      getTokenBucketAssociatedToFormMock.mockRejectedValueOnce(customError);
      const logMessageSpy = vi.spyOn(logMessage, "warn");

      await refundConsumedToken("clzsn6tao000611j50dexeob0");

      expect(logMessageSpy).toHaveBeenCalledWith(
        customError,
        "[token-bucket-limiter] Failed to refund consumed token for form clzsn6tao000611j50dexeob0",
      );
    });
  });
});
