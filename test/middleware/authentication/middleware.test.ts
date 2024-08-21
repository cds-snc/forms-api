import { vi, describe, it, expect, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { authenticationMiddleware } from "@middleware/authentication/middleware";
// biome-ignore lint/style/noNamespaceImport: To be able to use the Vitest `spyOn` function we need to import all
import * as introspectToken from "@lib/idp/introspectToken";

describe("Authorization middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = vi.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      sendStatus: vi.fn(),
    };
  });

  it("without headers", () => {
    authenticationMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
  });

  it("with headers but no bearer token", () => {
    mockRequest = {
      headers: {},
    };
    authenticationMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
  });

  it("with headers and a bearer token", () => {
    mockRequest = {
      headers: {
        authorization: "Bearer abc",
      },
      params: {
        formId: "def",
      },
    };
    const mockResponseSent = { json: vi.fn() };
    mockResponse = {
      status: vi.fn().mockImplementation(() => {
        return mockResponseSent;
      }),
    };

    const spy = vi.spyOn(introspectToken, "introspectToken");
    spy.mockReturnValue(
      Promise.resolve({ username: "abc", exp: Date.now() / 1000 + 1000 }),
    );

    authenticationMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
