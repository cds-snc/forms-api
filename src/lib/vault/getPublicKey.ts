import pgp from "pg-promise";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import pg from "pg-promise/typescript/pg-subset";

class GCFormsConnector {
  private static instance: GCFormsConnector | undefined = undefined;

  public db: pgp.IDatabase<{}, pg.IClient>;

  private constructor(connectionString: string) {
    this.db = pgp()(connectionString);
  }

  private static getConnectionString = async () => {
    try {
      const response = await AwsServicesConnector.getInstance().secretsClient.send(
        new GetSecretValueCommand({
          SecretId: "server-database-url",
        })
      );

      if (response.SecretString === undefined) {
        throw new Error("Database Connection URL not found in SecretsManager");
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

  public static async getInstance(): Promise<GCFormsConnector> {
    if (GCFormsConnector.instance === undefined) {
      const connectionString = await GCFormsConnector.getConnectionString();
      GCFormsConnector.instance = new GCFormsConnector(connectionString);
    }

    return GCFormsConnector.instance;
  }
}

export const getPublicKey = async (serviceAccountId: string) => {
  const connector = await GCFormsConnector.getInstance();
  const { publicKey }: { publicKey: string } = await connector.db.one(
    'SELECT "publicKey" FROM "ApiServiceAccount" WHERE id = $1',
    [serviceAccountId]
  );
  return publicKey;
};
