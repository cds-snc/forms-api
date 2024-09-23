import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import { getValueFromCache, cacheValue } from "@lib/utils/cache.js";
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
    logMessage.error(
      `[formsClient] Failed to retrieve public key. ServiceAccountId: ${serviceAccountId}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
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
  return getValueFromCache(`${REDIS_PUBLIC_KEY_PREFIX}:${serviceAccountId}`);
}

function cachePublicKey(
  publicKey: string,
  serviceAccountId: string,
): Promise<void> {
  return cacheValue(
    `${REDIS_PUBLIC_KEY_PREFIX}:${serviceAccountId}`,
    publicKey,
    CACHE_EXPIRY_DELAY_IN_SECONDS,
  );
}
