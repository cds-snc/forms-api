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

    const introspectTokenSpy = vi.spyOn(introspectToken, "introspectToken");
    
    introspectTokenSpy.mockReturnValue(
      Promise.resolve(undefined),
    );

    authenticationMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );
    expect(introspectTokenSpy).toHaveBeenCalledTimes(1);
    expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);

  });
});
