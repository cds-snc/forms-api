import { QueryCommand, type QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import type { NewFormSubmission } from "@lib/vault/types/formSubmission.types.js";
import { logMessage } from "@lib/logging/logger.js";
import { mapNewFormSubmissionFromDynamoDbResponse } from "@lib/vault/mappers/formSubmission.mapper.js";

export async function getNewFormSubmissions(
  formId: string,
  limit: number,
): Promise<NewFormSubmission[]> {
  try {
    let newFormSubmissions: NewFormSubmission[] = [];
    let lastEvaluatedKey: Record<string, string> | undefined | null = null;

    while (lastEvaluatedKey !== undefined) {
      const response: QueryCommandOutput =
        await AwsServicesConnector.getInstance().dynamodbClient.send(
          new QueryCommand({
            TableName: "Vault",
            IndexName: "StatusCreatedAt",
            ExclusiveStartKey: lastEvaluatedKey ?? undefined,
            Limit: limit - newFormSubmissions.length,
            KeyConditionExpression:
              "FormID = :formId AND begins_with(#statusCreatedAt, :status)",
            ProjectionExpression: "#name,CreatedAt",
            ExpressionAttributeNames: {
              "#statusCreatedAt": "Status#CreatedAt",
              "#name": "Name",
            },
            ExpressionAttributeValues: {
              ":formId": formId,
              ":status": "New",
            },
          }),
        );

      newFormSubmissions = newFormSubmissions.concat(
        response.Items?.map(mapNewFormSubmissionFromDynamoDbResponse) ?? [],
      );

      if (newFormSubmissions.length >= limit) {
        lastEvaluatedKey = undefined;
      } else {
        lastEvaluatedKey = response.LastEvaluatedKey;
      }
    }

    return newFormSubmissions;
  } catch (error) {
    logMessage.info(
      error,
      `[dynamodb] Failed to retrieve new form submissions. FormId: ${formId}`,
    );

    throw error;
  }
}
