import { describe, it, expect, beforeEach, vi } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { requestContextMiddleware } from "@middleware/requestContext.js";
import { AsyncLocalStorage } from "node:async_hooks";

describe("requestContextMiddleware should", () => {
  const requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
    vi.clearAllMocks();
  });

  it("run requestContextualStore and call next", () => {
    const asyncLocalStorageRunSpy = vi.spyOn(
      AsyncLocalStorage.prototype,
      "run",
    );
    requestContextMiddleware(requestMock, responseMock, nextMock);

    expect(asyncLocalStorageRunSpy).toHaveBeenCalled();
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("pass error to next function when processing fails due to internal error", () => {
    vi.spyOn(AsyncLocalStorage.prototype, "run").mockImplementationOnce(() => {
      throw new Error("custom error");
    });

    requestContextMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(
      new Error("[middleware][request-context] Internal error"),
    );
  });
});
