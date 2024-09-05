import { vi, describe, it, expect, beforeEach } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requestValidatorMiddleware } from "@middleware/requestValidator/middleware.js";
import {
  checkSchema,
  type Schema,
  validationResult,
  type ValidationChain,
  type ValidationError,
  type Result,
} from "express-validator";
import type { RunnableValidationChains } from "express-validator/lib/middlewares/schema";
import { buildMockedResponse } from "test/mocks/express.js";

vi.mock("express-validator");
const checkSchemaMock = vi.mocked(checkSchema);
const validationResultMock = vi.mocked(validationResult);

const mockRequest: Partial<Request> = {};
const mockResponse: Response = buildMockedResponse();
const mockNext: NextFunction = vi.fn();

checkSchemaMock.mockReturnValue({
  run: vi.fn(),
} as unknown as RunnableValidationChains<ValidationChain>);

describe("requestValidatorMiddleware should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accept request when validation is successful", async () => {
    validationResultMock.mockReturnValueOnce({
      isEmpty: vi.fn().mockReturnValue(true),
    } as Partial<Result<ValidationError>> as Result<ValidationError>);

    await requestValidatorMiddleware({} as Schema)(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it("reject request when validation failed because errors were detected", async () => {
    validationResultMock.mockReturnValueOnce({
      isEmpty: vi.fn().mockReturnValue(false),
      array: vi.fn().mockReturnValue([
        {
          type: "test",
          value: "test",
          msg: "test",
          path: "test",
          location: "test",
        },
      ]),
    } as Partial<Result<ValidationError>> as Result<ValidationError>);

    await requestValidatorMiddleware({} as Schema)(
      mockRequest as Request,
      mockResponse,
      mockNext,
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Invalid payload",
      details: [
        {
          type: "test",
          value: "test",
          msg: "test",
          path: "test",
          location: "test",
        },
      ],
    });
  });
});
