import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import {
  type VerifiedAccessToken,
  verifyAccessToken,
} from "@lib/idp/verifyAccessToken.js";
import { authenticationMiddleware } from "@middleware/authentication.js";
import {
  AccessTokenInvalidError,
  AccessTokenExpiredError,
  AccessControlError,
} from "@lib/idp/verifyAccessToken.js";

vi.mock("@lib/idp/verifyAccessToken");
const verifyAccessTokenMock = vi.mocked(verifyAccessToken);

describe("authenticationMiddleware should", () => {
  let requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
    vi.clearAllMocks();

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

    expect(requestMock.serviceUserId).toEqual("clzsn6tao000611j50dexeob0");
    expect(requestMock.serviceAccountId).toEqual("11111111111");
    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("respond with error when there is no authorization header", async () => {
    requestMock.headers = {};

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.status).toHaveBeenCalledWith(401);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Authorization header is missing",
    });
  });

  it("respond with error when the authorization header value is invalid", async () => {
    verifyAccessTokenMock.mockRejectedValueOnce(new AccessTokenInvalidError());

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
  });

  it("respond with error when the form identifier passed in the URL is different than the one associated to the token", async () => {
    verifyAccessTokenMock.mockRejectedValueOnce(new AccessControlError());

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.sendStatus).toHaveBeenCalledWith(403);
  });

  it("respond with error when the token is expired", async () => {
    verifyAccessTokenMock.mockRejectedValueOnce(new AccessTokenExpiredError());

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.status).toHaveBeenCalledWith(401);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Access token has expired",
    });
  });

  it("pass error to next function when processing fails due to internal error", async () => {
    verifyAccessTokenMock.mockRejectedValueOnce(new Error("custom error"));

    await authenticationMiddleware(requestMock, responseMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(
      new Error("[middleware] Internal error while authenticating user"),
    );
  });
});
