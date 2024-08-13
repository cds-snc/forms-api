import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AWS_REGION, LOCALSTACK_ENDPOINT } from "@src/config";

const globalConfig = {
  region: AWS_REGION,
};

const localstackConfig = {
  ...(LOCALSTACK_ENDPOINT && {
    endpoint: LOCALSTACK_ENDPOINT,
  }),
};

export const dynamodbClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    ...globalConfig,
    ...localstackConfig,
  }),
);
