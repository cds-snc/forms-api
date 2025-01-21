import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { versionMiddleware } from "@middleware/version.js";

describe("versionMiddleware should", () => {
  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
    vi.clearAllMocks();
  });

  it("respond with correct version", () => {
    const requestMock = getMockReq({
      params: {
        version: "v1",
      },
    });
    versionMiddleware(1)(requestMock, responseMock, nextMock);
    expect(nextMock).toHaveBeenCalledOnce();
    expect(nextMock).toHaveBeenCalledWith();
  });
  it("pass when requested version is lower", () => {
    const requestMock = getMockReq({
      params: {
        version: "v1",
      },
    });
    versionMiddleware(2)(requestMock, responseMock, nextMock);
    expect(nextMock).toHaveBeenCalledOnce();
    expect(nextMock).toHaveBeenCalledWith("route");
  });
  it("return latest when param is undefined", () => {
    const requestMock = getMockReq({
      params: {},
    });
    versionMiddleware(1)(requestMock, responseMock, nextMock);
    expect(nextMock).toHaveBeenCalledOnce();
    expect(nextMock).toHaveBeenCalledWith();
  });
  it("throw an error when an invalid param is provided", () => {
    const requestMock = getMockReq({
      params: {
        version: "vs",
      },
    });
    versionMiddleware(1)(requestMock, responseMock, nextMock);
    expect(nextMock).toHaveBeenCalledOnce();
    expect(nextMock).toHaveBeenCalledWith(
      new Error("Invalid API version requested."),
    );
  });
});
