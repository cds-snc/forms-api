import { RedisConnector } from "@lib/integration/redis/redisConnector.js";

export function getValueFromRedis(key: string): Promise<string | undefined> {
  return RedisConnector.getInstance()
    .then((redisConnector) => redisConnector.client.get(key))
    .then((value) => {
      return value ?? undefined;
    });
}

export function setValueInRedis(
  key: string,
  value: string,
  expiryDelayInSeconds?: number,
): Promise<void> {
  return (
    RedisConnector.getInstance()
      .then((redisConnector) =>
        redisConnector.client.set(key, value, {
          ...(expiryDelayInSeconds && {
            EX: expiryDelayInSeconds,
          }),
        }),
      )
      // Redis client `set` operation returns something that we don't need so we convert it to `void` by calling `Promise.resolve()`
      .then(() => Promise.resolve())
  );
}
