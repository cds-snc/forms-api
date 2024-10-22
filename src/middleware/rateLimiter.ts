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

    const tokenConsumptionResult = await consumeTokenIfAvailable(formId);

    response.header({
      "X-RateLimit-Limit": tokenConsumptionResult.bucketStatus.bucketCapacity,
      "X-RateLimit-Remaining":
        tokenConsumptionResult.bucketStatus.remainingTokens,
      "X-RateLimit-Reset": new Date(
        Date.now() +
          tokenConsumptionResult.bucketStatus.numberOfMillisecondsBeforeRefill,
      ),
    });

    if (tokenConsumptionResult.wasAbleToConsumeToken === false) {
      response.header({
        "Retry-After":
          tokenConsumptionResult.bucketStatus.numberOfMillisecondsBeforeRefill /
          1000,
      });

      logMessage.info(
        `[rate-limiter] Form ${formId} consumed all ${tokenConsumptionResult.bucketStatus.bucketCapacity} tokens. Bucket will be refilled in ${tokenConsumptionResult.bucketStatus.numberOfMillisecondsBeforeRefill / 1000} seconds`,
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
