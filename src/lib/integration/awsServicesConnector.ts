import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { AWS_REGION, LOCALSTACK_ENDPOINT } from "@src/config.js";

const globalConfig = {
  region: AWS_REGION,
};

const localstackConfig = {
  ...(LOCALSTACK_ENDPOINT && {
    endpoint: LOCALSTACK_ENDPOINT,
  }),
};

export class AwsServicesConnector {
  private static instance: AwsServicesConnector | undefined = undefined;

  public dynamodbClient: DynamoDBDocumentClient;

  public secretsClient: SecretsManagerClient;

  public sqsClient: SQSClient;

  private constructor() {
    this.dynamodbClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        ...globalConfig,
        ...localstackConfig,
      }),
    );
    this.secretsClient = new SecretsManagerClient({
      ...globalConfig,
      ...localstackConfig,
    });

    this.sqsClient = new SQSClient({
      ...globalConfig,
      ...localstackConfig,
    });
  }

  public static getInstance(): AwsServicesConnector {
    if (AwsServicesConnector.instance === undefined) {
      AwsServicesConnector.instance = new AwsServicesConnector();
    }

    return AwsServicesConnector.instance;
  }
}
