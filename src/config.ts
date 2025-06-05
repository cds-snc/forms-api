export enum EnvironmentMode {
  Local = "local",
  Staging = "staging",
  Production = "production",
}

export type TokenBucketConfiguration = {
  capacity: number;
  numberOfSecondsBeforeRefill: number;
};

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

// Rate limiting

export const lowRateLimiterConfiguration: TokenBucketConfiguration = {
  capacity: 500,
  numberOfSecondsBeforeRefill: 60,
};

export const highRateLimiterConfiguration: TokenBucketConfiguration = {
  capacity: 1000,
  numberOfSecondsBeforeRefill: 60,
};

// Redis

export const REDIS_URL: string = loadRequiredEnvVar("REDIS_URL");

// S3

export const VAULT_FILE_STORAGE_BUCKET_NAME: string = loadRequiredEnvVar(
  "VAULT_FILE_STORAGE_BUCKET_NAME",
);

// Zitadel

export const ZITADEL_TRUSTED_DOMAIN: string = loadRequiredEnvVar(
  "ZITADEL_TRUSTED_DOMAIN",
);

export const ZITADEL_URL: string = loadRequiredEnvVar("ZITADEL_URL");

export const ZITADEL_APPLICATION_KEY: string = loadRequiredEnvVar(
  "ZITADEL_APPLICATION_KEY",
);

// Internal function to load environment variables

function loadRequiredEnvVar(envVarName: string): string {
  const envVar = process.env[envVarName];

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
