import { requestValidatorMiddleware } from "@middleware/requestValidator.js";
import {
  type Schema,
  type ValidationChain,
  checkSchema,
} from "express-validator";
import type { RunnableValidationChains } from "express-validator/lib/middlewares/schema.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

vi.mock("express-validator");
const checkSchemaMock = vi.mocked(checkSchema);

describe("requestValidatorMiddleware should", () => {
  const requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    clearMockRes();
  });

  it("pass to the next function when validation is successful", async () => {
    checkSchemaMock.mockReturnValueOnce({
      run: vi.fn().mockResolvedValueOnce([
        {
          isEmpty: vi.fn().mockReturnValue(true),
          array: vi.fn().mockReturnValue([]),
        },
      ]),
    } as unknown as RunnableValidationChains<ValidationChain>);

    await requestValidatorMiddleware({} as Schema)(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledOnce();
  });

  it("respond with error when validation failed because errors were detected", async () => {
    checkSchemaMock.mockReturnValueOnce({
      run: vi.fn().mockResolvedValueOnce([
        {
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
        },
      ]),
    } as unknown as RunnableValidationChains<ValidationChain>);

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

  it("pass error to next function when processing fails due to internal error", async () => {
    checkSchemaMock.mockReturnValueOnce({
      run: vi.fn().mockRejectedValueOnce(new Error("custom error")),
    } as unknown as RunnableValidationChains<ValidationChain>);

    await requestValidatorMiddleware({} as Schema)(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(
      new Error("[middleware][request-validator] Internal error"),
    );
  });
});
