import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { introspectToken } from "@lib/idp/introspectToken.js";
import {
  getIntrospectionCache,
  setIntrospectionCache,
} from "@lib/idp/introspectionCache.js";
import { authenticationMiddleware } from "@middleware/authentication.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";

vi.mock("@lib/idp/introspectionCache");
const getIntrospectionCacheMock = vi.mocked(getIntrospectionCache);
const setIntrospectionCacheMock = vi.mocked(setIntrospectionCache);

vi.mock("@lib/idp/introspectToken");
const introspectTokenMock = vi.mocked(introspectToken);

const logEventSpy = vi.spyOn(auditLogsModule, "logEvent");

describe("authenticationMiddleware should", () => {
  let requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();

    requestMock = getMockReq({
      headers: {
        authorization: "Bearer abc",
      },
      params: {
        formId: "clzsn6tao000611j50dexeob0",
      },
    });
  });

  it("pass to the next function when the token is valid, not expired and associated to the form identifier passed in the URL", async () => {
    const introspectionResult = {
      serviceUserId: "clzsn6tao000611j50dexeob0",
      exp: Date.now() / 1000 + 100000,
      serviceAccountId: "11111111111",
    };
    introspectTokenMock.mockResolvedValueOnce(introspectionResult);

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).toHaveBeenCalledOnce();
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).toHaveBeenCalledWith(
      "abc",
      introspectionResult,
    );
  });

  it("respond with error when there is no authorization header", async () => {
    requestMock.headers = {};

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(401);
    expect(getIntrospectionCacheMock).not.toHaveBeenCalled();
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
  });

  it("respond with error when the authorization header value is invalid", async () => {
    introspectTokenMock.mockResolvedValueOnce(undefined);

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
  });

  it("respond with error when the form identifier passed in the URL is different than the one associated to the token", async () => {
    introspectTokenMock.mockResolvedValueOnce({
      serviceUserId: "invalid",
      exp: 0,
      serviceAccountId: "111111111111",
    });

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
    expect(logEventSpy).toHaveBeenNthCalledWith(
      1,
      "invalid",
      {
        id: "clzsn6tao000611j50dexeob0",
        type: "Form",
      },
      "AccessDenied",
      "User does not have access to this form",
    );
  });

  it("respond with error when the token is expired", async () => {
    introspectTokenMock.mockResolvedValueOnce({
      serviceUserId: "clzsn6tao000611j50dexeob0",
      exp: Date.now() / 1000 - 100000,
      serviceAccountId: "11111111111",
    });

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.status).toHaveBeenCalledWith(401);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Access token has expired",
    });
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
    expect(logEventSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeob0",
      {
        id: "clzsn6tao000611j50dexeob0",
        type: "Form",
      },
      "AccessDenied",
      "Access token has expired",
    );
  });
});
