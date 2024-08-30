import { createHash } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { introspectToken } from "@lib/idp/introspectToken";
import { RedisConnector } from "@src/lib/redisConnector";

const cacheExpiry = 60; // seconds

export function getAccessTokenCacheKey(accessToken: string): string {
  const hash = createHash("sha256").update(accessToken).digest("hex");
  return `api:auth:${hash}`;
}

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const accessToken = request.headers.authorization?.split(" ")[1];
  const redisConnector = await RedisConnector.getInstance();

  if (!accessToken) {
    return response.sendStatus(401);
  }

  // Check if there is a cached introspection result for this token.
  // This is being done to reduce strain on the IdP.
  const accessTokenKey = getAccessTokenCacheKey(accessToken);
  const introspectionCached = await redisConnector.client.get(accessTokenKey);
  console.debug("Introspection cache result", accessTokenKey, introspectionCached);

  const introspectionResult = introspectionCached
    ? JSON.parse(introspectionCached)
    : await introspectToken(accessToken);

  if (!introspectionResult) {
    return response.sendStatus(403);
  }

  const formId = request.params.formId;

  if (introspectionResult.username !== formId) {
    return response.sendStatus(403);
  }

  if (introspectionResult.exp < Date.now() / 1000) {
    return response.status(401).json({ message: "Token expired" });
  }

  // Store the introspection result in the cache
  await redisConnector.client.set(
    accessTokenKey,
    JSON.stringify(introspectionResult),
    { EX: cacheExpiry },
  );

  next();
}
