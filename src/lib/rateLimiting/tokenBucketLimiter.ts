import { getTokenBucketRateLimiterAssociatedToForm } from "@lib/rateLimiting/tokenBucketProvider.js";
import type { RateLimiterRes } from "rate-limiter-flexible";

export type BucketStatus = {
  bucketCapacity: number;
  remainingTokens: number;
  numberOfMillisecondsBeforeRefill: number;
};

export type ConsumeTokenResult = {
  wasAbleToConsumeToken: boolean;
  bucketStatus: BucketStatus;
};

export async function consumeTokenIfAvailable(
  formId: string,
): Promise<ConsumeTokenResult> {
  const tokenBucket = await getTokenBucketRateLimiterAssociatedToForm(formId);

  try {
    const consumptionResult = await tokenBucket.consume(formId);

    return {
      wasAbleToConsumeToken: true,
      bucketStatus: buildBucketStatus(tokenBucket.points, consumptionResult),
    };
  } catch (rateLimiterRes) {
    // Since our token buckets have an `insuranceLimiter` set up, the consume function promise can only be rejected with a `RateLimiterRes` object
    return {
      wasAbleToConsumeToken: false,
      bucketStatus: buildBucketStatus(
        tokenBucket.points,
        rateLimiterRes as RateLimiterRes,
      ),
    };
  }
}

export async function refundConsumedToken(formId: string): Promise<void> {
  const tokenBucket = await getTokenBucketRateLimiterAssociatedToForm(formId);
  await tokenBucket.reward(formId);
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
