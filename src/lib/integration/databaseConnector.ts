import pgp, { type IDatabase } from "pg-promise";
import type { IClient } from "pg-promise/typescript/pg-subset.js";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@src/config.js";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { logMessage } from "@lib/logging/logger.js";

const getConnectionString = (): Promise<string> => {
  if (ENVIRONMENT_MODE === EnvironmentMode.Local) {
    logMessage.debug("[database-connector] Using localstack connection string");

    return Promise.resolve(
      "postgres://localstack_postgres:chummy@localhost:4510/forms",
    );
  }

  return AwsServicesConnector.getInstance()
    .secretsClient.send(
      new GetSecretValueCommand({
        SecretId: "server-database-url",
      }),
    )
    .then((response) => {
      if (response.SecretString === undefined) {
        throw new Error(
          "[database-connector] Database Connection URL not found in SecretsManager",
        );
      }

      return response.SecretString;
    })
    .catch((error) => {
      logMessage.error(
        `[database-connector] Failed to retrieve server-database-url. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
        )}`,
      );

      throw error;
    });
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
