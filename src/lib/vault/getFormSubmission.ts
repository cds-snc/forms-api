import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/connectors/awsServicesConnector.js";
import {
  formSubmissionFromDynamoDbResponse,
  type FormSubmission,
} from "@lib/vault/dataStructures/formSubmission.js";
import { logMessage } from "@lib/logger.js";

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
          ProjectionExpression:
            "CreatedAt,#status,ConfirmationCode,FormSubmission",
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
    logMessage.error(
      `[dynamodb] Failed to retrieve form submission. FormId: ${formId} / SubmissionName: ${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}
