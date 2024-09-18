import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import {
  checkSchema,
  type Schema,
  validationResult,
  type ValidationChain,
  type ValidationError,
  type Result,
} from "express-validator";
import type { RunnableValidationChains } from "express-validator/lib/middlewares/schema.js";
import { requestValidatorMiddleware } from "@middleware/requestValidator/middleware.js";

vi.mock("express-validator");
const checkSchemaMock = vi.mocked(checkSchema);
const validationResultMock = vi.mocked(validationResult);

checkSchemaMock.mockReturnValue({
  run: vi.fn(),
} as unknown as RunnableValidationChains<ValidationChain>);

describe("requestValidatorMiddleware should", () => {
  const requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
  });

  it("pass to the next function when validation is successful", async () => {
    validationResultMock.mockReturnValueOnce({
      isEmpty: vi.fn().mockReturnValue(true),
    } as Partial<Result<ValidationError>> as Result<ValidationError>);

    await requestValidatorMiddleware({} as Schema)(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("respond with error when validation failed because errors were detected", async () => {
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
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseMock.status).toHaveBeenCalledWith(400);
    expect(responseMock.json).toHaveBeenCalledWith({
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
