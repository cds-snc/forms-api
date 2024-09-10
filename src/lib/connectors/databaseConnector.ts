import pgp from "pg-promise";
import { AwsServicesConnector } from "@lib/connectors/awsServicesConnector.js";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { logMessage } from "@src/lib/logger.js";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@src/config.js";

const getConnectionString = async () => {
  try {
    // If we're in local mode, return the localstack connection string for the Postgres database
    if (ENVIRONMENT_MODE === EnvironmentMode.Local) {
      logMessage.debug(
        "[database-connector] Using localstack connection string",
      );
      return "postgres://localstack_postgres:chummy@localhost:4510/forms";
    }

    const response =
      await AwsServicesConnector.getInstance().secretsClient.send(
        new GetSecretValueCommand({
          SecretId: "database-url",
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
      `[database-connector] Failed to retrieve database-url. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
};

const createDatabaseConnector = async () => {
  logMessage.debug("[database-connector] Creating new database connector");

  const connectionString = await getConnectionString();
  return pgp()(connectionString);
};

export const DatabaseConnectorClient = await createDatabaseConnector();
