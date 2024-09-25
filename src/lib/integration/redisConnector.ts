import { type RedisClientType, createClient } from "redis";
import { REDIS_URL } from "@config";
import { logMessage } from "@lib/logging/logger.js";

export class RedisConnector {
  private static instance: RedisConnector | undefined = undefined;
  private static RETRY_MAX = 10;
  private static RETRY_DELAY_STEP = 500; // milliseconds
  private static connectionPromise: Promise<RedisClientType>;

  public client: RedisClientType;

  private constructor() {
    this.client = createClient({
      url: REDIS_URL,
      socket: {
        // Reconnect strategy with exponential backoff
        reconnectStrategy: (retries: number): number | Error =>
          retries < RedisConnector.RETRY_MAX
            ? RedisConnector.RETRY_DELAY_STEP * retries
            : new Error("Failed to connect to Redis"),
      },
    });

    this.client
      .on("error", (err: Error) =>
        logMessage.error(
          `[redis-connector] Redis client error: ${err.message}`,
        ),
      )
      .on("ready", () =>
        logMessage.debug("[redis-connector]  Redis client ready!"),
      )
      .on("reconnecting", () =>
        logMessage.debug("[redis-connector] Redis client reconnecting..."),
      );
  }

  /**
   * Uses the singleton promise pattern to initialize the RedisConnector class instance.
   * This ensures that only one connection is attempted to the Redis server when the
   * instance is first initialized, even if multiple concurrent calls are made.
   * @returns {Promise<RedisConnector>}
   */
  public static getInstance(): Promise<RedisConnector> {
    if (RedisConnector.instance === undefined) {
      RedisConnector.instance = new RedisConnector();
      RedisConnector.connectionPromise =
        RedisConnector.instance.client.connect();
    }

    // Ensure all calls to getInstance() wait for the connection to be initialized before returning the Redis Instance
    return RedisConnector.connectionPromise.then(() => {
      return RedisConnector.instance as RedisConnector;
    });
  }
}
