import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { AWS_REGION } from "@config";

const globalConfig = {
  region: AWS_REGION,
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
      }),
    );

    this.secretsClient = new SecretsManagerClient({
      ...globalConfig,
    });

    this.sqsClient = new SQSClient({
      ...globalConfig,
    });
  }

  public static getInstance(): AwsServicesConnector {
    if (AwsServicesConnector.instance === undefined) {
      AwsServicesConnector.instance = new AwsServicesConnector();
    }

    return AwsServicesConnector.instance;
  }
}
