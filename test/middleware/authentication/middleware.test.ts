import { vi, describe, it, expect, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";
import type { RedisClientType } from "redis";
import { authenticationMiddleware } from "@middleware/authentication/middleware";
import { introspectToken } from "@lib/idp/introspectToken";
import { RedisConnector } from "@src/lib/redisConnector";

vi.mock("@src/lib/redisConnector");
const redisConnectorMock = vi.mocked(RedisConnector);

vi.mock("@lib/idp/introspectToken");
const introspectTokenMock = vi.mocked(introspectToken);

function buildMockResponse() {
  const res = {} as Response;

  res.sendStatus = vi.fn();
  res.json = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);

  return res;
}

describe("authenticationMiddleware should", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Response;
  const mockNext: NextFunction = vi.fn();
  const redisClient: RedisClientType = {
    get: vi.fn(),
    set: vi.fn(),
  } as unknown as RedisClientType;
  const authTokenCacheKey =
    "api:auth:ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=";

  beforeEach(() => {
    vi.resetAllMocks();

    mockRequest = {
      headers: {
        authorization: "Bearer abc",
      },
      params: {
        formId: "clzsn6tao000611j50dexeob0",
      },
    };

    mockResponse = buildMockResponse();

    redisConnectorMock.getInstance.mockResolvedValue({ client: redisClient });
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
    expect(redisClient.get).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
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
    expect(redisClient.get).toHaveBeenCalledWith(authTokenCacheKey);
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it("reject request when the form identifier passed in the URL is different than the one associated to the token", async () => {
    introspectTokenMock.mockResolvedValueOnce({ username: "invalid", exp: 0 });

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
    expect(redisClient.get).toHaveBeenCalledWith(authTokenCacheKey);
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it("reject request when the token is expired", async () => {
    introspectTokenMock.mockResolvedValueOnce({
      username: "clzsn6tao000611j50dexeob0",
      exp: Date.now() / 1000 - 100000,
    });

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Token expired",
    });
    expect(redisClient.get).toHaveBeenCalledWith(authTokenCacheKey);
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it("accept request when the token is valid, not expired and associated to the form identifier passed in the URL", async () => {
    const introspectionResult = {
      username: "clzsn6tao000611j50dexeob0",
      exp: Date.now() / 1000 + 100000,
    };
    introspectTokenMock.mockResolvedValueOnce(introspectionResult);

    await authenticationMiddleware(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalled();
    expect(redisClient.get).toHaveBeenCalledWith(authTokenCacheKey);
    expect(redisClient.set).toHaveBeenCalledWith(
      authTokenCacheKey,
      JSON.stringify(introspectionResult),
      { EX: 300 },
    );
  });
});
