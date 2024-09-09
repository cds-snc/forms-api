import pgp from "pg-promise";
import { AwsServicesConnector } from "@lib/connectors/awsServicesConnector.js";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import type pg from "pg-promise/typescript/pg-subset.js";
import { logMessage } from "@src/lib/logger.js";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@src/config.js";

export class DatabaseConnector {
  private static instance: DatabaseConnector;
  private static connectionStringPromise: Promise<string>;

  public db: pgp.IDatabase<Record<string, unknown>, pg.IClient>;

  private constructor(connectionString: string) {
    this.db = pgp()(connectionString);
  }

  private static async getConnectionString() {
    try {
      // If we're in local mode, return the localstack connection string for the Postgres database
      if (ENVIRONMENT_MODE === EnvironmentMode.Local) {
        return "postgres://localstack_postgres:chummy@localhost:4510/forms";
      }

      const response =
        await AwsServicesConnector.getInstance().secretsClient.send(
          new GetSecretValueCommand({
            SecretId: "server-database-url",
          }),
        );

      if (response.SecretString === undefined) {
        throw new Error("Database Connection URL not found in SecretsManager");
      }

      logMessage.debug(
        `[database-connector] Retrieved server-database-url: ${response.SecretString}`,
      );

      return response.SecretString;
    } catch (error) {
      logMessage.error(
        `[database-connector] Failed to retrieve server-database-url. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
        )}`,
      );

      throw error;
    }
  }

  public static async getInstance(): Promise<DatabaseConnector> {
    if (DatabaseConnector.connectionStringPromise) {
      // This is to ensure that any other calls to getInstance() will wait for the connection string to be resolved and the instance to be created
      await DatabaseConnector.connectionStringPromise;
    } else {
      // If the promise has not yet been created, create it and the instance
      DatabaseConnector.connectionStringPromise =
        DatabaseConnector.getConnectionString();

      DatabaseConnector.instance = new DatabaseConnector(
        await DatabaseConnector.connectionStringPromise,
      );
    }

    return DatabaseConnector.instance;
  }
}
