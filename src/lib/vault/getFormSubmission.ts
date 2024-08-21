import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import {
  formSubmissionFromDynamoDbResponse,
  type FormSubmission,
} from "@lib/vault/dataStructures/formSubmission";

export async function getFormSubmission(
  formId: string,
  submissionName: string,
): Promise<FormSubmission | undefined> {
  try {
    const response =
      await AwsServicesConnector.getInstance().dynamodbClient.send(
        new GetCommand({
          TableName: "Vault",
          Key: { FormID: formId, NAME_OR_CONF: `NAME#${submissionName}` },
          ProjectionExpression: "#status,FormSubmission",
          ExpressionAttributeNames: {
            "#status": "Status",
          },
        }),
      );

    if (response.Item === undefined) {
      return undefined;
    }

    return formSubmissionFromDynamoDbResponse(response.Item);
  } catch (error) {
    console.error(
      `[dynamodb] Failed to retrieve form submission. FormId: ${formId} / SubmissionName: ${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );
    throw error;
  }
}
