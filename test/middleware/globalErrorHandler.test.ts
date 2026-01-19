import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import type { Request } from "express";
import { globalErrorHandlerMiddleware } from "@middleware/globalErrorHandler.js";
import { logMessage } from "@lib/logging/logger.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as tokenBucketLimiterModule from "@lib/rateLimiting/tokenBucketLimiter.js";
import { retrieveOptionalRequestContextData } from "@lib/storage/requestContextualStore.js";

vi.mock("@lib/storage/requestContextualStore");
const retrieveOptionalRequestContextDataMock = vi.mocked(
  retrieveOptionalRequestContextData,
);

const refundConsumedTokenSpy = vi.spyOn(
  tokenBucketLimiterModule,
  "refundConsumedToken",
);

describe("globalErrorHandlerMiddleware should", () => {
  let requestMock: Request;

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
    vi.clearAllMocks();

    requestMock = getMockReq();
  });

  it("respond with error when called", () => {
    const customError = new Error("custom error");
    const logMessageSpy = vi.spyOn(logMessage, "error");

    globalErrorHandlerMiddleware(
      customError,
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining("Global unhandled error"),
    );
  });

  it("refund a token if request had consumed one", () => {
    retrieveOptionalRequestContextDataMock.mockReturnValueOnce(
      "clzsn6tao000611j50dexeob0",
    );
    const customError = new Error("custom error");

    globalErrorHandlerMiddleware(
      customError,
      requestMock,
      responseMock,
      nextMock,
    );

    expect(refundConsumedTokenSpy).toHaveBeenCalledWith(
      "clzsn6tao000611j50dexeob0",
    );
  });

  it("not refund any token if request had not consumed one", () => {
    const customError = new Error("custom error");

    globalErrorHandlerMiddleware(
      customError,
      requestMock,
      responseMock,
      nextMock,
    );

    expect(refundConsumedTokenSpy).not.toHaveBeenCalled();
  });
});
