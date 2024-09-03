// biome-ignore lint/correctness/noNodejsModules: we need the node crypto module
import { createHash } from "node:crypto";
import type { IntrospectionResult } from "@lib/idp/introspectToken";
import { RedisConnector } from "@src/lib/redisConnector";

const cacheExpiry = 300; // seconds

function getAccessTokenCacheKey(accessToken: string): string {
  const hash = createHash("sha256").update(accessToken).digest("base64");
  return `api:auth:${hash}`;
}

export async function getIntrospectionCache(
  accessToken: string,
): Promise<IntrospectionResult | undefined> {
  const accessTokenKey = getAccessTokenCacheKey(accessToken);
  const redisConnector = await RedisConnector.getInstance();
  const introspectionCached = await redisConnector.client.get(accessTokenKey);
  console.debug("Introspection cache", accessTokenKey, introspectionCached);
  return introspectionCached
    ? (JSON.parse(introspectionCached) as IntrospectionResult)
    : undefined;
}

export async function setIntrospectionCache(
  accessToken: string,
  introspectionResult: IntrospectionResult,
): Promise<void> {
  const accessTokenKey = getAccessTokenCacheKey(accessToken);
  const redisConnector = await RedisConnector.getInstance();
  await redisConnector.client.set(
    accessTokenKey,
    JSON.stringify(introspectionResult),
    { EX: cacheExpiry },
  );
}