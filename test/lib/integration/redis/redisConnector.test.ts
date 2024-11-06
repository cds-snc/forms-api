import { describe, it, expect, vi, beforeEach } from "vitest";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as redisModule from "redis";
import { RedisConnector } from "@lib/integration/redis/redisConnector.js";

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
