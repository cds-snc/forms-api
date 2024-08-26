import type { NextFunction, Request, Response } from "express";
import {
  checkSchema,
  type Location,
  validationResult,
  type Schema,
} from "express-validator";

export function requestValidatorMiddleware(
  validationSchema: Schema,
  validationLocations?: Location[],
) {
  return async (request: Request, response: Response, next: NextFunction) => {
    /**
     * Because of an existing issue we have to run the next two lines of code instead of just the first one.
     * See https://github.com/express-validator/express-validator/issues/1298
     */
    await checkSchema(validationSchema, validationLocations).run(request);

    const result = validationResult(request);

    if (result.isEmpty() === false) {
      return response
        .status(400)
        .json({ error: "Invalid payload", details: result.array() });
    }

    next();
  };
}
