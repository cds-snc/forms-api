import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import {
  type VerifiedAccessToken,
  verifyAccessToken,
} from "@lib/idp/verifyAccessToken.js";
import { authenticationMiddleware } from "@middleware/authentication.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";

vi.mock("@lib/idp/verifyAccessToken");
const verifyAccessTokenMock = vi.mocked(verifyAccessToken);

const auditLogSpy = vi.spyOn(auditLogsModule, "auditLog");

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
    const verifiedAccessToken: VerifiedAccessToken = {
      expirationEpochTime: Date.now() / 1000 + 100000,
      serviceAccountId: "11111111111",
      serviceUserId: "clzsn6tao000611j50dexeob0",
    };
    verifyAccessTokenMock.mockResolvedValueOnce(verifiedAccessToken);

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("respond with error when there is no authorization header", async () => {
    requestMock.headers = {};

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(401);
  });

  it("respond with error when the authorization header value is invalid", async () => {
    verifyAccessTokenMock.mockResolvedValueOnce(undefined);

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
  });

  it("respond with error when the form identifier passed in the URL is different than the one associated to the token", async () => {
    const verifiedAccessToken: VerifiedAccessToken = {
      expirationEpochTime: Date.now() / 1000 + 100000,
      serviceAccountId: "11111111111",
      serviceUserId: "clzsn6tao000611j50dexeoa1",
    };
    verifyAccessTokenMock.mockResolvedValueOnce(verifiedAccessToken);

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
    expect(auditLogSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeoa1",
      {
        id: "clzsn6tao000611j50dexeob0",
        type: "Form",
      },
      "AccessDenied",
      "User does not have access to this form",
    );
  });

  it("respond with error when the token is expired", async () => {
    const verifiedAccessToken: VerifiedAccessToken = {
      expirationEpochTime: Date.now() / 1000 - 100000,
      serviceAccountId: "11111111111",
      serviceUserId: "clzsn6tao000611j50dexeob0",
    };
    verifyAccessTokenMock.mockResolvedValueOnce(verifiedAccessToken);

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.status).toHaveBeenCalledWith(401);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Access token has expired",
    });
    expect(auditLogSpy).toHaveBeenNthCalledWith(
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
