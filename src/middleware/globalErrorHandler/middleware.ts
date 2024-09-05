import type { Request, Response, NextFunction } from "express";
import { logMessage } from "@src/lib/logger.js";

export function globalErrorHandlerMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  logMessage.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  return response.sendStatus(500);
}
