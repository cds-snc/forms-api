import { DatabaseConnectorClient } from "@src/lib/connectors/databaseConnector.js";
import { RedisConnector } from "@lib/connectors/redisConnector.js";

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
  const cachedPublicKey = await getPublicKeyFromCache(serviceAccountId);
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  const { publicKey }: { publicKey: string } =
    await DatabaseConnectorClient.one(
      'SELECT "publicKey" FROM "ApiServiceAccount" WHERE id = $1',
      [serviceAccountId],
    );

  await cachePublicKey(publicKey, serviceAccountId);

  return publicKey;
};
