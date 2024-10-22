import { RedisConnector } from "@lib/integration/redisConnector.js";
import {
  type RateLimiterAbstract,
  RateLimiterMemory,
  RateLimiterRedis,
} from "rate-limiter-flexible";

/**
 * TODO:
 * - extract rate limiter token and duration config in config file under specific object structure
 */

export enum TokenBucketCapacity {
  Low = 0,
  High = 1,
}

const redisClient = await RedisConnector.getInstance().then(
  (instance) => instance.client,
);

const backupTokenBucket = new RateLimiterMemory({
  keyPrefix: "backup-token-bucket",
  points: 10, // 10 tokens
  duration: 60, // 1 minute,
});

const lowCapacityTokenBucket = new RateLimiterRedis({
  keyPrefix: "low-capacity-token-bucket",
  storeClient: redisClient,
  useRedisPackage: true,
  points: 10, // 10 tokens
  duration: 60, // 1 minute,
  inMemoryBlockOnConsumed: 10,
  inMemoryBlockDuration: 60,
  insuranceLimiter: backupTokenBucket,
});

const highCapacityTokenBucket = new RateLimiterRedis({
  keyPrefix: "high-capacity-token-bucket",
  storeClient: redisClient,
  useRedisPackage: true,
  points: 100, // 100 tokens
  duration: 60, // 1 minute
  inMemoryBlockOnConsumed: 100,
  inMemoryBlockDuration: 60,
  insuranceLimiter: backupTokenBucket,
});

export function getTokenBucket(
  capacity: TokenBucketCapacity,
): RateLimiterAbstract {
  switch (capacity) {
    case TokenBucketCapacity.High:
      return highCapacityTokenBucket;
    default:
      return lowCapacityTokenBucket;
  }
}
