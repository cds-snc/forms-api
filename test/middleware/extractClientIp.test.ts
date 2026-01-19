import { describe, it, expect, beforeEach, vi } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { extractClientIpMiddleware } from "@middleware/extractClientIp.js";
import {
  RequestContextualStoreKey,
  saveRequestContextData,
} from "@lib/storage/requestContextualStore.js";

vi.mock("@lib/storage/requestContextualStore");
const saveRequestContextDataMock = vi.mocked(saveRequestContextData);

describe("extractClientIpMiddleware should", () => {
  const requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
    vi.clearAllMocks();
  });

  it("extract and save the client IP if there is one in the request headers", () => {
    requestMock.headers = {
      "x-forwarded-for": "8.8.8.8",
    };

    extractClientIpMiddleware(requestMock, responseMock, nextMock);

    expect(saveRequestContextDataMock).toHaveBeenCalledWith(
      RequestContextualStoreKey.ClientIp,
      "8.8.8.8",
    );
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("extract and save the last client IP if there is more than one in the request headers", () => {
    requestMock.headers = {
      "x-forwarded-for": "2.2.2.2,8.8.8.8",
    };

    extractClientIpMiddleware(requestMock, responseMock, nextMock);

    expect(saveRequestContextDataMock).toHaveBeenCalledWith(
      RequestContextualStoreKey.ClientIp,
      "8.8.8.8",
    );
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("extract and save the fallback client IP if none are available in the request headers", () => {
    requestMock.headers = {};

    extractClientIpMiddleware(requestMock, responseMock, nextMock);

    expect(saveRequestContextDataMock).toHaveBeenCalledWith(
      RequestContextualStoreKey.ClientIp,
      "0.0.0.0",
    );
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("pass error to next function when processing fails due to internal error", () => {
    saveRequestContextDataMock.mockImplementationOnce(() => {
      throw new Error("custom error");
    });

    extractClientIpMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(
      new Error("[middleware][extract-client-ip] Internal error"),
    );
  });
});
