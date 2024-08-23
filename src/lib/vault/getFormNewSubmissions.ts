import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import {
  formNewSubmissionFromDynamoDbResponse,
  FormSubmissionStatus,
  type FormNewSubmission,
} from "@lib/vault/dataStructures/formSubmission";

export async function getFormNewSubmissions(
  formId: string,
): Promise<FormNewSubmission[] | undefined> {
  try {
    const response =
      await AwsServicesConnector.getInstance().dynamodbClient.send(
        new QueryCommand({
          TableName: "Vault",
          IndexName: "Status",
          KeyConditionExpression: "#FormID = :formId AND #Status = :status",
          ProjectionExpression: "CreatedAt,#Name",
          ExpressionAttributeNames: {
            "#FormID": "FormID",
            "#Status": "Status",
            "#Name": "Name",
          },
          ExpressionAttributeValues: {
            ":formId": formId,
            ":status": FormSubmissionStatus.New,
          },
        }),
      );

    if (response.Items && response.Items.length > 0) {
      return formNewSubmissionFromDynamoDbResponse(response.Items);
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
