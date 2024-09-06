import pgp from "pg-promise";
import { AwsServicesConnector } from "@lib/connectors/awsServicesConnector.js";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import type pg from "pg-promise/typescript/pg-subset.js";
import { logMessage } from "@src/lib/logger.js";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@src/config.js";

const connectionString = await (async () => {
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
})();

export class DatabaseConnector {
  private static instance: DatabaseConnector;
  private static connectionStringPromise: Promise<
    pgp.IDatabase<Record<string, unknown>, pg.IClient>
  >;

  public db: pgp.IDatabase<Record<string, unknown>, pg.IClient>;

  private constructor(connectionString: string) {
    this.db = pgp()(connectionString);
  }

  public static getInstance(): DatabaseConnector {
    if (DatabaseConnector.instance === undefined) {
      DatabaseConnector.instance = new DatabaseConnector(connectionString);
    }

    return DatabaseConnector.instance;
  }
}
