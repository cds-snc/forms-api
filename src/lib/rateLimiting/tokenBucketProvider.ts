import {
  type RateLimiterAbstract,
  RateLimiterMemory,
  RateLimiterRedis,
} from "rate-limiter-flexible";
import { RedisConnector } from "@lib/integration/redisConnector.js";
import {
  highRateLimiterConfiguration,
  lowRateLimiterConfiguration,
} from "@config";
import { getValueFromCache } from "@lib/utils/cache.js";
import { logMessage } from "@lib/logging/logger.js";

const REDIS_RATE_LIMIT_KEY_PREFIX: string = "rate-limit";

export enum TokenBucketCapacity {
  Low = 0,
  High = 1,
}

const redisClient = await RedisConnector.getInstance().then(
  (instance) => instance.client,
);

const inMemoryBackupTokenBucket = new RateLimiterMemory({
  keyPrefix: "backup-token-bucket",
  points: lowRateLimiterConfiguration.capacity,
  duration: lowRateLimiterConfiguration.numberOfSecondsBeforeRefill,
});

const lowCapacityTokenBucket = new RateLimiterRedis({
  keyPrefix: "low-capacity-token-bucket",
  storeClient: redisClient,
  useRedisPackage: true,
  points: lowRateLimiterConfiguration.capacity,
  duration: lowRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  inMemoryBlockOnConsumed: lowRateLimiterConfiguration.capacity,
  inMemoryBlockDuration:
    lowRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  insuranceLimiter: inMemoryBackupTokenBucket,
});

const highCapacityTokenBucket = new RateLimiterRedis({
  keyPrefix: "high-capacity-token-bucket",
  storeClient: redisClient,
  useRedisPackage: true,
  points: highRateLimiterConfiguration.capacity,
  duration: highRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  inMemoryBlockOnConsumed: highRateLimiterConfiguration.capacity,
  inMemoryBlockDuration:
    highRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  insuranceLimiter: inMemoryBackupTokenBucket,
});

export function getTokenBucketAssociatedToForm(
  formId: string,
): Promise<RateLimiterAbstract> {
  return getValueFromCache(`${REDIS_RATE_LIMIT_KEY_PREFIX}:${formId}`)
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
        `[token-bucket-provider] Failed to retrieve token bucket capacity for form ${formId}`,
      );

      return getTokenBucket(TokenBucketCapacity.Low);
    });
}

function getTokenBucket(capacity: TokenBucketCapacity): RateLimiterAbstract {
  switch (capacity) {
    case TokenBucketCapacity.High:
      return highCapacityTokenBucket;
    default:
      return lowCapacityTokenBucket;
  }
}
