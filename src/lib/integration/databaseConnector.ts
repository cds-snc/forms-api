import { PostgresConnector } from "@gcforms/connectors";
import { logMessage } from "@lib/logging/logger.js";

const createDatabaseConnector = (): Promise<PostgresConnector> => {
  logMessage.info("[database-connector] Creating database connector");

  return PostgresConnector.defaultUsingPostgresConnectionUrlFromAwsSecret(
    "server-database-url",
  );
};

export const databaseConnector: PostgresConnector =
  await createDatabaseConnector();
