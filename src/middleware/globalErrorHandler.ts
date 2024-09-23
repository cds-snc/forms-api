import type { Request, Response, NextFunction } from "express";
import { logMessage } from "@lib/logging/logger.js";

export function globalErrorHandlerMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  logMessage.error(error, "Global unhandled error");
  response.sendStatus(500);
}
