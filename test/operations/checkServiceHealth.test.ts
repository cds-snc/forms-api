import { checkServiceHealthOperation } from "@operations/checkServiceHealth.js";
import { beforeEach, describe, expect, it } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

describe("checkServiceHealthOperation handler should", () => {
  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
  });

  it("respond with running status if service is healthy", async () => {
    const requestMock = getMockReq();

    await checkServiceHealthOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith({ status: "running" });
  });
});
