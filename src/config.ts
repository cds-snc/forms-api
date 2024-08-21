import dotenv from "dotenv";

dotenv.config();

// AWS SDK

export const AWS_REGION: string = "ca-central-1";

// Express

export const SERVER_PORT: number = 3001;

// Local configuration

export const LOCALSTACK_ENDPOINT: string | undefined = loadOptionalEnvVar(
  "LOCALSTACK_ENDPOINT",
);

// Zitadel

export const ZITADEL_APPLICATION_KEY: string = loadRequiredEnvVar(
  "ZITADEL_APPLICATION_KEY",
);

export const ZITADEL_DOMAIN: string = loadRequiredEnvVar("ZITADEL_DOMAIN");

// Internal function to load environment variables

function loadOptionalEnvVar(envVarName: string): string | undefined {
  return process.env[envVarName];
}

function loadRequiredEnvVar(envVarName: string): string {
  if (process.env.NODE_ENV === "test") {
    return "TEST_IN_PROGRESS";
  }

  const envVar = loadOptionalEnvVar(envVarName);

  if (envVar === undefined) {
    throw new Error(`Environment variable ${envVarName} is not defined.`);
  }

  return envVar;
}
