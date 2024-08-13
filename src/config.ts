import dotenv from "dotenv";

dotenv.config();

// AWS SDK

export const AWS_REGION: string = "ca-central-1";

// Express

export const SERVER_PORT: number = 3001;

// Local configuration

export const LOCALSTACK_ENDPOINT: string | undefined =
  process.env.LOCALSTACK_ENDPOINT;
