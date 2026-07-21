import type { NextFunction, Request, Response } from "express";
import { type Location, type Schema, checkSchema } from "express-validator";

export function requestValidatorMiddleware(
  validationSchema: Schema,
  validationLocations?: Location[],
) {
  return async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const schemaValidationResults = await checkSchema(
        validationSchema,
        validationLocations,
      ).run(request);

      const isPayloadInvalid = schemaValidationResults.some(
        (result) => result.isEmpty() === false,
      );

      const detectedErrors = schemaValidationResults.flatMap((result) =>
        result.array(),
      );

      if (isPayloadInvalid) {
        response.status(400).json({
          error: "Invalid payload",
          details: detectedErrors,
        });

        return;
      }

      next();
    } catch (error) {
      next(
        new Error("[middleware][request-validator] Internal error", {
          cause: error,
        }),
      );
    }
  };
}
