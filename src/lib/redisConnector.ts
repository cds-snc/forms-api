import { type RedisClientType, createClient } from "redis";
import { REDIS_URL } from "@src/config";

export class RedisConnector {
  private static instance: RedisConnector | undefined = undefined;

  public client: RedisClientType;

  private constructor() {
    this.client = createClient({ url: REDIS_URL });
    this.client
      .on("error", (err) => console.error("Redis client error:", err))
      .on("reconnecting", () => console.info("Redis client reconnecting..."));
  }

  public static async getInstance(): Promise<RedisConnector> {
    if (
      RedisConnector.instance === undefined ||
      !RedisConnector.instance.client.isReady
    ) {
      RedisConnector.instance = new RedisConnector();
      await RedisConnector.instance.client.connect();
    }
    return RedisConnector.instance;
  }
}
