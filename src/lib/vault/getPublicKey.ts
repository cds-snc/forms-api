import pgp from "pg-promise";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import type pg from "pg-promise/typescript/pg-subset";

class DatabaseConnector {
  private static instance: DatabaseConnector | undefined = undefined;

  public db: pgp.IDatabase<Record<string, unknown>, pg.IClient>;

  private constructor(connectionString: string) {
    this.db = pgp()(connectionString);
  }

  private static getConnectionString = async () => {
    try {
      const response = await AwsServicesConnector.getInstance().secretsClient.send(
        new GetSecretValueCommand({
          // biome-ignore lint/style/useNamingConvention: <AWS controls the property names>
          SecretId: "server-database-url",
        })
      );

      if (response.SecretString === undefined) {
        throw new Error("Database Connection URL not found in SecretsManager");
      }

      // Localstack behaves differently and requires a proxy endpoint
      if (process.env.LOCALSTACK_ENDPOINT) {
        return "postgres://localstack_postgres:chummy@localhost:4510/forms";
      }

      return response.SecretString;
    } catch (error) {
      console.error(
        `[secrets-manager] Failed to retrieve server-database-url. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error)
        )}`
      );

      throw error;
    }
  };

  public static async getInstance(): Promise<DatabaseConnector> {
    if (DatabaseConnector.instance === undefined) {
      const connectionString = await DatabaseConnector.getConnectionString();
      DatabaseConnector.instance = new DatabaseConnector(connectionString);
    }

    return DatabaseConnector.instance;
  }
}

export const getPublicKey = async (serviceAccountId: string) => {
  const connector = await DatabaseConnector.getInstance();
  const { publicKey }: { publicKey: string } = await connector.db.one(
    'SELECT "publicKey" FROM "ApiServiceAccount" WHERE id = $1',
    [serviceAccountId]
  );
  return publicKey;
};
