import { QueryCommand, type QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ENVIRONMENT_MODE, EnvironmentMode } from "@config";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { logMessage } from "@lib/logging/logger.js";
import { mapNewFormSubmissionFromDynamoDbResponse } from "@lib/vault/mappers/formSubmission.mapper.js";
import type { NewFormSubmission } from "@lib/vault/types/formSubmission.types.js";

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
            IndexName:
              ENVIRONMENT_MODE !== EnvironmentMode.production // Condition to be deleted once StatusCreatedAt_v2 becomes available in Production
                ? "StatusCreatedAt_v2"
                : "StatusCreatedAt",
            ExclusiveStartKey: lastEvaluatedKey ?? undefined,
            Limit: limit - newFormSubmissions.length,
            KeyConditionExpression:
              "FormID = :formId AND begins_with(#statusCreatedAt, :status)",
            ProjectionExpression: `#name,CreatedAt${ENVIRONMENT_MODE !== EnvironmentMode.production ? ",Version" : ""}`, // Condition to be deleted once StatusCreatedAt_v2 becomes available in Production
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
