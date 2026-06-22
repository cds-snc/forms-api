import { RedisConnector } from "@lib/integration/redis/redisConnector.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as redisModule from "redis";
import { beforeEach, describe, expect, it, vi } from "vitest";

const redisCreateClientSpy = vi.spyOn(redisModule, "createClient");

describe("RedisConnector should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create a Redis client instance once", async () => {
    await RedisConnector.getInstance();
    await RedisConnector.getInstance();

    expect(redisCreateClientSpy).toHaveBeenCalledOnce();
  });
});
