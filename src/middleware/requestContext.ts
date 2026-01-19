import type { NextFunction, Request, Response } from "express";
import { requestContextualStore } from "@lib/storage/requestContextualStore.js";

export function requestContextMiddleware(
  _: Request,
  __: Response,
  next: NextFunction,
): void {
  try {
    // Sets up the request context store and ensures that all subsequent middleware and route handlers run within that context
    requestContextualStore.run(new Map<string, string>(), () => next());
  } catch (error) {
    next(
      new Error("[middleware][request-context] Internal error", {
        cause: error,
      }),
    );
  }
}
