import type { Request, Response, NextFunction } from "express";
import { logMessage } from "@lib/logging/logger.js";
import { refundConsumedToken } from "@lib/rateLimiting/tokenBucketLimiter.js";
import {
  RequestContextualStoreKey,
  retrieveOptionalRequestContextData,
} from "@lib/storage/requestContextualStore.js";

export async function globalErrorHandlerMiddleware(
  error: Error,
  _: Request,
  response: Response,
  _next: NextFunction,
): Promise<void> {
  logMessage.error(
    error,
    "[middleware][global-error-handler] Global unhandled error",
  );

  const tokenConsumedOnFormId = retrieveOptionalRequestContextData(
    RequestContextualStoreKey.tokenConsumedOnFormId,
  );

  if (tokenConsumedOnFormId !== undefined) {
    await refundConsumedToken(tokenConsumedOnFormId);
  }

  response.sendStatus(500);
}
