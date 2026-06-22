import { routeNotFoundMiddleware } from "@middleware/routeNotFound.js";
import { beforeEach, describe, expect, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

describe("routeNotFoundMiddleware should", () => {
  const requestMock = getMockReq();

  const { res: responseMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
  });

  it("respond with error when called", () => {
    routeNotFoundMiddleware(requestMock, responseMock);

    expect(responseMock.sendStatus).toHaveBeenCalledWith(404);
  });
});
