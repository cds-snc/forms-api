import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import {
  newFormSubmissionFromDynamoDbResponse,
  type NewFormSubmission,
} from "@lib/vault/dataStructures/formSubmission";

export async function getNewFormSubmissions(
  formId: string,
): Promise<NewFormSubmission[] | undefined> {
  try {
    const response =
      await AwsServicesConnector.getInstance().dynamodbClient.send(
        new QueryCommand({
          TableName: "Vault",
          IndexName: "Status",
          ScanIndexForward: false,
          KeyConditionExpression: "FormID = :formId AND #Status = :status",
          ProjectionExpression: "CreatedAt,#Name",
          ExpressionAttributeNames: {
            "#Status": "Status",
            "#Name": "Name",
          },
          ExpressionAttributeValues: {
            ":formId": formId,
            ":status": "New",
          },
          Limit: 100, // Limit to 100 new submissions per call (not sorted by submission time)
        }),
      );

    if (response.Items) {
      return newFormSubmissionFromDynamoDbResponse(response.Items);
    }
    return undefined;
  } catch (error) {
    console.error(
      `[dynamodb] Failed to retrieve new submissions. FormId: ${formId}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );
    throw error;
  }
}
