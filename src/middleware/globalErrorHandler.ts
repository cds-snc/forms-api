import type { Request, Response, NextFunction } from "express";
import { logMessage } from "@lib/logging/logger.js";
import { refundConsumedToken } from "@lib/rateLimiting/tokenBucketLimiter.js";

export async function globalErrorHandlerMiddleware(
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction,
): Promise<void> {
  logMessage.error(
    error,
    "[middleware][global-error-handler] Global unhandled error",
  );

  if (request.tokenConsumedOnFormId !== undefined) {
    await refundConsumedToken(request.tokenConsumedOnFormId);
  }

  response.sendStatus(500);
}
