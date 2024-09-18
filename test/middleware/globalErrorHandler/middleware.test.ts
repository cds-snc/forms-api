import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { globalErrorHandlerMiddleware } from "@middleware/globalErrorHandler/middleware.js";
import { logMessage } from "@lib/logging/logger.js";

describe("globalErrorHandlerMiddleware should", () => {
  const requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
  });

  it("respond with error when called", () => {
    const logMessageSpy = vi.spyOn(logMessage, "error");

    globalErrorHandlerMiddleware(
      new Error("This is a custom error"),
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
    expect(logMessageSpy).toHaveBeenCalledWith(
      expect.stringContaining('"stack":"Error: This is a custom error'),
    );
  });
});
