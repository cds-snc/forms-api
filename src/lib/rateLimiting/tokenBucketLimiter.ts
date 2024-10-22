import { RedisConnector } from "@lib/integration/redisConnector.js";
import { logMessage } from "@lib/logging/logger.js";
import {
  getTokenBucket,
  TokenBucketCapacity,
} from "@lib/rateLimiting/tokenBucketProvider.js";
import type {
  RateLimiterAbstract,
  RateLimiterRes,
} from "rate-limiter-flexible";

const REDIS_RATE_LIMIT_KEY_PREFIX: string = "rate-limit";

export type BucketStatus = {
  bucketCapacity: number;
  remainingTokens: number;
  numberOfMillisecondsBeforeRefill: number;
};

export type TokenConsumptionResult = {
  wasAbleToConsumeToken: boolean;
  bucketStatus: BucketStatus;
};

export async function consumeTokenIfAvailable(
  formId: string,
): Promise<TokenConsumptionResult> {
  const tokenBucket = await getTokenBucketAssociatedToForm(formId);

  try {
    const rateLimiterResponse = await tokenBucket.consume(formId);

    return {
      wasAbleToConsumeToken: true,
      bucketStatus: buildBucketStatus(tokenBucket.points, rateLimiterResponse),
    };
  } catch (error) {
    return {
      wasAbleToConsumeToken: false,
      bucketStatus: buildBucketStatus(
        tokenBucket.points,
        error as RateLimiterRes,
      ),
    };
  }
}

export async function refundConsumedToken(formId: string): Promise<void> {
  try {
    const tokenBucket = await getTokenBucketAssociatedToForm(formId);
    await tokenBucket.reward(formId);
  } catch (error) {
    logMessage.warn(
      error,
      `[token-bucket-limiter] Failed to refund consumed token for form ${formId}`,
    );
  }
}

function getTokenBucketAssociatedToForm(
  formId: string,
): Promise<RateLimiterAbstract> {
  return RedisConnector.getInstance()
    .then((redisConnector) =>
      redisConnector.client.get(`${REDIS_RATE_LIMIT_KEY_PREFIX}:${formId}`),
    )
    .then((value) => {
      switch (value) {
        case "high":
          return getTokenBucket(TokenBucketCapacity.High);
        default:
          return getTokenBucket(TokenBucketCapacity.Low);
      }
    })
    .catch((error) => {
      logMessage.warn(
        error,
        `[token-bucket-limiter] Failed to retrieve token bucket capacity for form ${formId}`,
      );

      return getTokenBucket(TokenBucketCapacity.Low);
    });
}

function buildBucketStatus(
  bucketCapacity: number,
  rateLimiterResponse: RateLimiterRes,
): BucketStatus {
  return {
    bucketCapacity: bucketCapacity,
    remainingTokens: rateLimiterResponse.remainingPoints,
    numberOfMillisecondsBeforeRefill: rateLimiterResponse.msBeforeNext,
  };
}
