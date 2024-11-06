import type { NextFunction, Request, Response } from "express";
import { consumeTokenIfAvailable } from "@lib/rateLimiting/tokenBucketLimiter.js";
import { logMessage } from "@lib/logging/logger.js";

export async function rateLimiterMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const formId = request.params.formId;

    const consumeTokenResult = await consumeTokenIfAvailable(formId);

    response.header({
      "X-RateLimit-Limit": consumeTokenResult.bucketStatus.bucketCapacity,
      "X-RateLimit-Remaining": consumeTokenResult.bucketStatus.remainingTokens,
      "X-RateLimit-Reset": new Date(
        Date.now() +
          consumeTokenResult.bucketStatus.numberOfMillisecondsBeforeRefill,
      ),
    });

    if (consumeTokenResult.wasAbleToConsumeToken === false) {
      response.header({
        "Retry-After":
          consumeTokenResult.bucketStatus.numberOfMillisecondsBeforeRefill /
          1000,
      });

      logMessage.info(
        `[rate-limiter] Form ${formId} consumed all ${consumeTokenResult.bucketStatus.bucketCapacity} tokens. Bucket will be refilled in ${consumeTokenResult.bucketStatus.numberOfMillisecondsBeforeRefill / 1000} seconds`,
      );

      response.sendStatus(429);
      return;
    }

    request.tokenConsumedOnFormId = formId;

    next();
  } catch (error) {
    next(
      new Error("[middleware] Internal error with rate limiter", {
        cause: error,
      }),
    );
  }
}
