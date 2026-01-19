import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { rateLimiterMiddleware } from "@middleware/rateLimiter.js";
import { consumeTokenIfAvailable } from "@lib/rateLimiting/tokenBucketLimiter.js";
import { logMessage } from "@lib/logging/logger.js";
import { RequestContextualStoreKey } from "@lib/storage/requestContextualStore.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as requestContextualStoreModule from "@lib/storage/requestContextualStore.js";

vi.mock("@lib/rateLimiting/tokenBucketLimiter");
const consumeTokenIfAvailableMock = vi.mocked(consumeTokenIfAvailable);

vi.mock("@lib/storage/requestContextualStore");
const saveRequestContextDataSpy = vi.spyOn(
  requestContextualStoreModule,
  "saveRequestContextData",
);

describe("rateLimiterMiddleware should", () => {
  const requestMock = getMockReq({
    params: {
      formId: "clzsn6tao000611j50dexeob0",
    },
  });

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pass to the next function when tokens are available", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1519129853500));

    consumeTokenIfAvailableMock.mockResolvedValue({
      wasAbleToConsumeToken: true,
      bucketStatus: {
        bucketCapacity: 10,
        remainingTokens: 5,
        numberOfMillisecondsBeforeRefill: 2000,
      },
    });

    await rateLimiterMiddleware(requestMock, responseMock, nextMock);

    expect(responseMock.header).toHaveBeenCalledWith({
      "Access-Control-Expose-Headers":
        "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After",
      "X-RateLimit-Limit": 10,
      "X-RateLimit-Remaining": 5,
      "X-RateLimit-Reset": new Date("2018-02-20T12:30:55.500Z"),
    });
    expect(saveRequestContextDataSpy).toHaveBeenCalledWith(
      RequestContextualStoreKey.TokenConsumedOnFormId,
      "clzsn6tao000611j50dexeob0",
    );
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("respond with error when there is no more token available", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1519129853500));

    consumeTokenIfAvailableMock.mockResolvedValue({
      wasAbleToConsumeToken: false,
      bucketStatus: {
        bucketCapacity: 10,
        remainingTokens: 0,
        numberOfMillisecondsBeforeRefill: 2000,
      },
    });
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await rateLimiterMiddleware(requestMock, responseMock, nextMock);

    expect(responseMock.header).toHaveBeenNthCalledWith(1, {
      "Access-Control-Expose-Headers":
        "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After",
      "X-RateLimit-Limit": 10,
      "X-RateLimit-Remaining": 0,
      "X-RateLimit-Reset": new Date("2018-02-20T12:30:55.500Z"),
    });
    expect(responseMock.header).toHaveBeenNthCalledWith(2, {
      "Retry-After": 2,
    });
    expect(logMessageSpy).toHaveBeenCalledWith(
      "[middleware][rate-limiter] Form clzsn6tao000611j50dexeob0 consumed all 10 tokens. Bucket will be refilled in 2 seconds",
    );
    expect(responseMock.sendStatus).toHaveBeenCalledWith(429);
  });

  it("pass error to next function when processing fails due to internal error", async () => {
    consumeTokenIfAvailableMock.mockRejectedValueOnce(
      new Error("custom error"),
    );

    await rateLimiterMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(
      new Error("[middleware][rate-limiter] Internal error"),
    );
  });
});
