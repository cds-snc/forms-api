import { QueryCommand, type QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import {
  newFormSubmissionFromDynamoDbResponse,
  type NewFormSubmission,
} from "@lib/vault/dataStructures/formSubmission";

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
            ProjectionExpression: "CreatedAt,#name",
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
        response.Items?.map(newFormSubmissionFromDynamoDbResponse) ?? [],
      );

      if (newFormSubmissions.length >= limit) {
        lastEvaluatedKey = undefined;
      } else {
        lastEvaluatedKey = response.LastEvaluatedKey;
      }
    }

    return newFormSubmissions;
  } catch (error) {
    console.error(
      `[dynamodb] Failed to retrieve new form submissions. FormId: ${formId}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}
