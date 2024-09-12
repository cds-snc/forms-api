import { vi, describe, it, expect, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { authenticationMiddleware } from "@middleware/authentication/middleware.js";
import { introspectToken } from "@lib/idp/introspectToken.js";
import { buildMockedResponse } from "test/mocks/express.js";
import {
  getIntrospectionCache,
  setIntrospectionCache,
} from "@lib/idp/introspectionCache.js";

vi.mock("@lib/idp/introspectionCache");
const getIntrospectionCacheMock = vi.mocked(getIntrospectionCache);
const setIntrospectionCacheMock = vi.mocked(setIntrospectionCache);

vi.mock("@lib/idp/introspectToken");
const introspectTokenMock = vi.mocked(introspectToken);

const mockResponse: Response = buildMockedResponse();
const mockNext: NextFunction = vi.fn();

describe("authenticationMiddleware should", () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      headers: {
        authorization: "Bearer abc",
      },
      params: {
        formId: "clzsn6tao000611j50dexeob0",
      },
    };
  });

  it("reject request with there is no authorization header", async () => {
    mockRequest.headers = {};

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
    expect(getIntrospectionCacheMock).not.toHaveBeenCalled();
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
  });

  it("reject request when the authorization header value is invalid", async () => {
    introspectTokenMock.mockResolvedValueOnce(undefined);

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
  });

  it("reject request when the form identifier passed in the URL is different than the one associated to the token", async () => {
    introspectTokenMock.mockResolvedValueOnce({
      username: "invalid",
      exp: 0,
      serviceAccountId: "111111111111",
    });

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
  });

  it("reject request when the token is expired", async () => {
    introspectTokenMock.mockResolvedValueOnce({
      username: "clzsn6tao000611j50dexeob0",
      exp: Date.now() / 1000 - 100000,
      serviceAccountId: "11111111111",
    });

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Access token has expired",
    });
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).not.toHaveBeenCalled();
  });

  it("accept request when the token is valid, not expired and associated to the form identifier passed in the URL", async () => {
    const introspectionResult = {
      username: "clzsn6tao000611j50dexeob0",
      exp: Date.now() / 1000 + 100000,
      serviceAccountId: "11111111111",
    };
    introspectTokenMock.mockResolvedValueOnce(introspectionResult);

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalled();
    expect(getIntrospectionCacheMock).toHaveBeenCalledWith("abc");
    expect(setIntrospectionCacheMock).toHaveBeenCalledWith(
      "abc",
      introspectionResult,
    );
  });
});
