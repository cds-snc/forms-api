import {
  type RateLimiterAbstract,
  RateLimiterMemory,
  RateLimiterRedis,
} from "rate-limiter-flexible";
import { RedisConnector } from "@lib/integration/redis/redisConnector.js";
import {
  highRateLimiterConfiguration,
  lowRateLimiterConfiguration,
} from "@config";
import { getValueFromRedis } from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";

const REDIS_RATE_LIMIT_KEY_PREFIX: string = "rate-limit";

const redisClient = await RedisConnector.getInstance().then(
  (instance) => instance.client,
);

const lowCapacityTokenBucket = new RateLimiterRedis({
  keyPrefix: "low-capacity-token-bucket",
  storeClient: redisClient,
  useRedisPackage: true,
  points: lowRateLimiterConfiguration.capacity,
  duration: lowRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  inMemoryBlockOnConsumed: lowRateLimiterConfiguration.capacity,
  inMemoryBlockDuration:
    lowRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  insuranceLimiter: new RateLimiterMemory({
    points: lowRateLimiterConfiguration.capacity,
    duration: lowRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  }),
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
  insuranceLimiter: new RateLimiterMemory({
    points: highRateLimiterConfiguration.capacity,
    duration: highRateLimiterConfiguration.numberOfSecondsBeforeRefill,
  }),
});

export function getTokenBucketRateLimiterAssociatedToForm(
  formId: string,
): Promise<RateLimiterAbstract> {
  return getValueFromRedis(`${REDIS_RATE_LIMIT_KEY_PREFIX}:${formId}`)
    .then((value) => {
      switch (value) {
        case "high":
          return highCapacityTokenBucket;
        default:
          return lowCapacityTokenBucket;
      }
    })
    .catch((error) => {
      logMessage.warn(
        error,
        `[token-bucket-provider] Failed to retrieve token bucket capacity for form ${formId}. Will use low capacity bucket by default`,
      );

      return lowCapacityTokenBucket;
    });
}
