import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import {
  getValueFromRedis,
  setValueInRedis,
} from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";

const REDIS_PUBLIC_KEY_PREFIX: string = "api:publicKey";
const CACHE_EXPIRY_DELAY_IN_SECONDS: number = 300;

export const getPublicKey = async (serviceAccountId: string) => {
  try {
    const cachedPublicKey = await getPublicKeyFromCache(serviceAccountId);

    if (cachedPublicKey) {
      return cachedPublicKey;
    }

    const publicKey = await retrievePublicKeyFromDatabase(serviceAccountId);

    if (publicKey === undefined) {
      throw new Error(
        "Could not find public key associated to service account id",
      );
    }

    await cachePublicKey(publicKey, serviceAccountId);

    return publicKey;
  } catch (error) {
    logMessage.info(
      error,
      `[formsClient] Failed to retrieve public key. ServiceAccountId: ${serviceAccountId}`,
    );

    throw error;
  }
};

function retrievePublicKeyFromDatabase(
  serviceAccountId: string,
): Promise<string | undefined> {
  return DatabaseConnectorClient.oneOrNone<Record<string, unknown>>(
    'SELECT "publicKey" FROM "ApiServiceAccount" WHERE id = $1',
    [serviceAccountId],
  ).then((result) => {
    if (result === null) {
      return undefined;
    }

    return result.publicKey as string;
  });
}

function getPublicKeyFromCache(
  serviceAccountId: string,
): Promise<string | undefined> {
  return getValueFromRedis(`${REDIS_PUBLIC_KEY_PREFIX}:${serviceAccountId}`);
}

function cachePublicKey(
  publicKey: string,
  serviceAccountId: string,
): Promise<void> {
  return setValueInRedis(
    `${REDIS_PUBLIC_KEY_PREFIX}:${serviceAccountId}`,
    publicKey,
    CACHE_EXPIRY_DELAY_IN_SECONDS,
  );
}
