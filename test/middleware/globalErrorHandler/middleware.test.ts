import { vi, describe, it, expect } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { globalErrorHandlerMiddleware } from "@src/middleware/globalErrorHandler/middleware";
import { buildMockedResponse } from "test/mocks/express";

describe("globalErrorHandlerMiddleware should", () => {
  it("return HTTP code 500 and log error", () => {
    const mockedRequest: Partial<Request> = {};
    const mockedResponse: Partial<Response> = buildMockedResponse();
    const mockedNext: NextFunction = vi.fn();
    const consoleErrorLogSpy = vi.spyOn(console, "error");

    globalErrorHandlerMiddleware(
      new Error("This is a custom error"),
      mockedRequest as Request,
      mockedResponse as Response,
      mockedNext,
    );

    expect(mockedNext).not.toHaveBeenCalled();
    expect(mockedResponse.sendStatus).toHaveBeenCalledWith(500);
    expect(consoleErrorLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"stack":"Error: This is a custom error'),
    );
  });
});
