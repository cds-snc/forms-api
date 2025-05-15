import pgp, { type IDatabase } from "pg-promise";
import type { IClient } from "pg-promise/typescript/pg-subset.js";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { logMessage } from "@lib/logging/logger.js";

const getConnectionString = async (): Promise<string> => {
  try {
    const response =
      await AwsServicesConnector.getInstance().secretsClient.send(
        new GetSecretValueCommand({
          SecretId: "server-database-url",
        }),
      );

    if (response.SecretString === undefined) {
      throw new Error(
        "[database-connector] Database Connection URL not found in SecretsManager",
      );
    }

    return response.SecretString;
  } catch (error) {
    logMessage.error(
      error,
      "[database-connector] Failed to retrieve server-database-url",
    );

    throw error;
  }
};

const createDatabaseConnector = (): Promise<
  IDatabase<Record<string, unknown>, IClient>
> => {
  logMessage.debug("[database-connector] Creating new database connector");

  return getConnectionString().then((connectionString) =>
    pgp()(connectionString),
  );
};

export const DatabaseConnectorClient: IDatabase<
  Record<string, unknown>,
  IClient
> = await createDatabaseConnector();
