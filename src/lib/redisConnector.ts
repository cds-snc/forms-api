import { type RedisClientType, createClient } from "redis";
import { REDIS_URL } from "@src/config";

export class RedisConnector {
  private static instance: RedisConnector | undefined = undefined;
  private static RETRY_MAX = 5;
  private static RETRY_DELAY = 1000;

  public client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries: number): number | Error =>
          retries < RedisConnector.RETRY_MAX
            ? RedisConnector.RETRY_DELAY
            : new Error("Failed to connect to Redis"),
      },
    });
    this.client
      .on("error", (err: Error) => console.error("Redis client error:", err))
      .on("ready", () => console.debug("Redis client ready!"))
      .on("reconnecting", () => console.debug("Redis client reconnecting..."));
  }

  public static async getInstance(): Promise<RedisConnector> {
    if (RedisConnector.instance === undefined) {
      RedisConnector.instance = new RedisConnector();
      RedisConnector.instance.client.connect();
    }
    return RedisConnector.instance;
  }
}
