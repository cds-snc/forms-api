import { databaseConnector } from "@lib/integration/databaseConnector.js";
import {
  getValueFromRedis,
  setValueInRedis,
} from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";

const REDIS_PUBLIC_KEY_PREFIX: string = "api:publicKey";
const CACHE_EXPIRY_DELAY_IN_SECONDS: number = 300;

export async function getPublicKey(serviceAccountId: string): Promise<string> {
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
}

async function retrievePublicKeyFromDatabase(
  serviceAccountId: string,
): Promise<string | undefined> {
  const results = await databaseConnector.executeSqlStatement()<
    { publicKey: string }[]
  >`SELECT "publicKey" FROM "ApiServiceAccount" WHERE id = ${serviceAccountId}`;

  if (results.length !== 1) {
    return undefined;
  }

  return results[0].publicKey;
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
