import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { globalErrorHandlerMiddleware } from "@middleware/globalErrorHandler.js";
import { logMessage } from "@lib/logging/logger.js";

describe("globalErrorHandlerMiddleware should", () => {
  const requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
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
});
