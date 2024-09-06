import { DatabaseConnector } from "@lib/connectors/databaseConnector.js";
import { RedisConnector } from "@lib/connectors/redisConnector.js";
import { logMessage } from "@src/lib/logger.js";

const cachePublicKey = async (publicKey: string, serviceAccountId: string) => {
  const redisConnector = await RedisConnector.getInstance();
  await redisConnector.client.set(
    `api:publicKey:${serviceAccountId}`,
    publicKey,
    { EX: 300 },
  );
};

const getPublicKeyFromCache = async (serviceAccountId: string) => {
  const redisConnector = await RedisConnector.getInstance();
  return await redisConnector.client.get(`api:publicKey:${serviceAccountId}`);
};

export const getPublicKey = async (serviceAccountId: string) => {
  const connector = await DatabaseConnector.getInstance();
  const cachedPublicKey = await getPublicKeyFromCache(serviceAccountId);
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  const { publicKey }: { publicKey: string } = await connector.db.one(
    'SELECT "publicKey" FROM "ApiServiceAccount" WHERE id = $1',
    [serviceAccountId],
  );

  logMessage.debug(
    `Public key for service account ${serviceAccountId} found in database with value ${publicKey}`,
  );

  await cachePublicKey(publicKey, serviceAccountId);

  return publicKey;
};
