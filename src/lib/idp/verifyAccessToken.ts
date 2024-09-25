import { introspectAccessToken } from "@lib/integration/zitadelConnector.js";
import { cacheValue, getValueFromCache } from "@lib/utils/cache.js";
import { createHash } from "node:crypto";
import { logMessage } from "@lib/logging/logger.js";

export type VerifiedAccessToken = {
  expirationEpochTime: number;
  serviceAccountId: string;
  serviceUserId: string;
};

const REDIS_INTROSPECTION_RESULT_KEY_PREFIX: string = "api:auth";
const CACHE_EXPIRY_DELAY_IN_SECONDS: number = 300;

export async function verifyAccessToken(
  accessToken: string,
): Promise<VerifiedAccessToken | undefined> {
  try {
    const cachedVerifiedAccessToken =
      await getVerifiedAccessTokenFromCache(accessToken);

    if (cachedVerifiedAccessToken !== undefined) {
      return cachedVerifiedAccessToken;
    }

    const accessTokenIntrospectionResult =
      await introspectAccessToken(accessToken);

    if (accessTokenIntrospectionResult.active === false) {
      return undefined;
    }

    if (
      accessTokenIntrospectionResult.exp === undefined ||
      accessTokenIntrospectionResult.sub === undefined ||
      accessTokenIntrospectionResult.username === undefined
    ) {
      throw new Error(
        "Access token introspection result is missing required properties",
      );
    }

    const verifiedAccessToken: VerifiedAccessToken = {
      expirationEpochTime: accessTokenIntrospectionResult.exp,
      serviceAccountId: accessTokenIntrospectionResult.sub,
      serviceUserId: accessTokenIntrospectionResult.username,
    };

    await cacheVerifiedAccessToken(accessToken, verifiedAccessToken);

    return verifiedAccessToken;
  } catch (error) {
    logMessage.error(error, "[idp] Failed to verify access token");
    throw error;
  }
}

function getVerifiedAccessTokenFromCache(
  accessToken: string,
): Promise<VerifiedAccessToken | undefined> {
  const key = getVerifiedAccessTokenCacheKey(accessToken);

  return getValueFromCache(key).then((value) => {
    return value ? (JSON.parse(value) as VerifiedAccessToken) : undefined;
  });
}

function cacheVerifiedAccessToken(
  accessToken: string,
  introspectionResult: VerifiedAccessToken,
): Promise<void> {
  const key = getVerifiedAccessTokenCacheKey(accessToken);

  return cacheValue(
    key,
    JSON.stringify(introspectionResult),
    CACHE_EXPIRY_DELAY_IN_SECONDS,
  );
}

function getVerifiedAccessTokenCacheKey(accessToken: string): string {
  const hash = createHash("sha256").update(accessToken).digest("base64");
  return `${REDIS_INTROSPECTION_RESULT_KEY_PREFIX}:${hash}`;
}
