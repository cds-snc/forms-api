import { introspectAccessToken } from "@lib/integration/zitadelConnector.js";
import {
  setValueInRedis,
  getValueFromRedis,
} from "@lib/integration/redis/redisClientAdapter.js";
import { createHash } from "node:crypto";
import { logMessage } from "@lib/logging/logger.js";
import { auditLog } from "@lib/logging/auditLogs.js";

export type VerifiedAccessToken = {
  expirationEpochTime: number;
  serviceAccountId: string;
  serviceUserId: string;
};

const REDIS_INTROSPECTION_RESULT_KEY_PREFIX: string = "api:auth";
const CACHE_EXPIRY_DELAY_IN_SECONDS: number = 300;

export class AccessTokenExpiredError extends Error {
  constructor() {
    super("Access token has expired");
    this.name = "AccessTokenExpiredError";
  }
}

export class AccessTokenInvalidError extends Error {
  constructor() {
    super("Access token is invalid");
    this.name = "AccessTokenInvalidError";
  }
}

export class AccessControlError extends Error {
  constructor() {
    super("Access is forbidden");
    this.name = "AccessForbiddenError";
  }
}

export async function verifyAccessToken(accessToken: string, formId: string) {
  try {
    // Get token from cache, it if doesn't exist introspect from IDP
    const { introspectedAccessToken, cached } =
      await getIntrospectedAccessTokenFromCache(accessToken).then(
        async (cachedToken) => {
          if (cachedToken !== undefined) {
            return { introspectedAccessToken: cachedToken, cached: true };
          }
          const introspectedAccessToken = await generateIntrospectedAccessToken(
            accessToken,
            formId,
          );
          return { introspectedAccessToken, cached: false };
        },
      );

    // Checks for expiry and access control
    validateIntrospectedToken(introspectedAccessToken, formId);

    // If the token was not cached, cache the valid token
    if (!cached) {
      await cacheVerifiedAccessToken(accessToken, introspectedAccessToken);
    }
    return introspectedAccessToken;
  } catch (error) {
    logMessage.warn(error, "[idp] Failed to verify access token");
    throw error;
  }
}

function getIntrospectedAccessTokenFromCache(
  accessToken: string,
): Promise<VerifiedAccessToken | undefined> {
  const key = getVerifiedAccessTokenCacheKey(accessToken);

  return getValueFromRedis(key).then((value) => {
    return value ? (JSON.parse(value) as VerifiedAccessToken) : undefined;
  });
}

function cacheVerifiedAccessToken(
  accessToken: string,
  introspectionResult: VerifiedAccessToken,
): Promise<void> {
  const key = getVerifiedAccessTokenCacheKey(accessToken);

  return setValueInRedis(
    key,
    JSON.stringify(introspectionResult),
    CACHE_EXPIRY_DELAY_IN_SECONDS,
  );
}

function getVerifiedAccessTokenCacheKey(accessToken: string): string {
  const hash = createHash("sha256").update(accessToken).digest("base64");
  return `${REDIS_INTROSPECTION_RESULT_KEY_PREFIX}:${hash}`;
}

async function generateIntrospectedAccessToken(
  accessToken: string,
  formId: string,
) {
  const introspectedToken = await introspectAccessToken(accessToken);
  // Active can be false if the token is invalid, expired, or does not exist.
  if (introspectedToken.active === false) {
    auditLog(
      // We use the formId as the userId here because we don't have a valid userId
      formId,
      {
        type: "ServiceAccount",
        id: "unknown",
      },
      "InvalidAccessToken",
      "Access token was marked as invalid by IDP",
    );
    throw new AccessTokenInvalidError();
  }
  if (
    introspectedToken.exp === undefined ||
    introspectedToken.sub === undefined ||
    introspectedToken.username === undefined
  ) {
    logMessage.warn(
      introspectedToken,
      "[idp] Introspection result is missing required properties",
    );

    throw new Error(
      `[idp] Introspection result is missing required properties.  Payload: ${JSON.stringify(introspectedToken)}`,
    );
  }

  auditLog(
    introspectedToken.username,
    { type: "ServiceAccount", id: introspectedToken.sub },
    "IntrospectedAccessToken",
    "Access token has been introspected by the IDP",
  );

  return {
    expirationEpochTime: introspectedToken.exp,
    serviceAccountId: introspectedToken.sub,
    serviceUserId: introspectedToken.username,
  };
}

function validateIntrospectedToken(token: VerifiedAccessToken, formId: string) {
  const { serviceUserId, serviceAccountId, expirationEpochTime } = token;

  if (expirationEpochTime < Date.now() / 1000) {
    auditLog(
      serviceUserId,
      { type: "ServiceAccount", id: serviceAccountId },
      "InvalidAccessToken",
      "Access token has expired",
    );
    throw new AccessTokenExpiredError();
  }

  if (serviceUserId !== formId) {
    auditLog(
      serviceUserId,
      { type: "Form", id: formId },
      "AccessDenied",
      `User ${serviceAccountId} does not have access to form ${formId}`,
    );
    throw new AccessControlError();
  }
}
