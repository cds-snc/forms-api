import dotenv from "dotenv";

export enum EnvironmentMode {
  Local = "local",
  Staging = "staging",
  Production = "production",
}

dotenv.config();

// AWS SDK

export const AWS_REGION: string = "ca-central-1";

// Environment mode

export const ENVIRONMENT_MODE: EnvironmentMode =
  mapEnvironmentModeFromStringToEnum(loadRequiredEnvVar("ENVIRONMENT_MODE"));

// Express

export const SERVER_PORT: number = 3001;

// Freshdesk

export const FRESHDESK_API_URL: string = "https://cds-snc.freshdesk.com/api";

export const FRESHDESK_API_KEY: string =
  loadRequiredEnvVar("FRESHDESK_API_KEY");

// Local configuration

export const LOCALSTACK_ENDPOINT: string | undefined = loadOptionalEnvVar(
  "LOCALSTACK_ENDPOINT",
);

// Redis

export const REDIS_URL: string = loadRequiredEnvVar("REDIS_URL");

// Zitadel

export const ZITADEL_DOMAIN: string = loadRequiredEnvVar("ZITADEL_DOMAIN");

export const ZITADEL_APPLICATION_KEY: string = loadRequiredEnvVar(
  "ZITADEL_APPLICATION_KEY",
);

// Internal function to load environment variables

function loadOptionalEnvVar(envVarName: string): string | undefined {
  return process.env[envVarName];
}

function loadRequiredEnvVar(envVarName: string): string {
  const envVar = loadOptionalEnvVar(envVarName);

  if (envVar === undefined) {
    throw new Error(`Environment variable ${envVarName} is not defined.`);
  }

  return envVar;
}

function mapEnvironmentModeFromStringToEnum(
  environmentMode: string,
): EnvironmentMode {
  if (environmentMode === "staging") {
    return EnvironmentMode.Staging;
  }

  if (environmentMode === "production") {
    return EnvironmentMode.Production;
  }

  return EnvironmentMode.Local;
}
