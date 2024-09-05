import { describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { routeNotFoundMiddleware } from "@src/middleware/routeNotFound/middleware.js";
import { buildMockedResponse } from "test/mocks/express.js";

describe("routeNotFoundMiddleware should", () => {
  it("return HTTP code 404", () => {
    const mockedRequest: Partial<Request> = {};
    const mockedResponse: Partial<Response> = buildMockedResponse();

    routeNotFoundMiddleware(
      mockedRequest as Request,
      mockedResponse as Response,
    );

    expect(mockedResponse.sendStatus).toHaveBeenCalledWith(404);
  });
});
