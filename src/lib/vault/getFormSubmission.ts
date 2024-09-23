import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import type {
  FormSubmission,
  FormSubmissionStatus,
} from "@lib/vault/types/formSubmission.js";
import { logMessage } from "@lib/logging/logger.js";

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
            "CreatedAt,#status,ConfirmationCode,FormSubmission,FormSubmissionHash",
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
      error,
      `[dynamodb] Failed to retrieve form submission. FormId: ${formId} / SubmissionName: ${submissionName}`,
    );

    throw error;
  }
}

function formSubmissionFromDynamoDbResponse(
  response: Record<string, unknown>,
): FormSubmission {
  return {
    createdAt: response.CreatedAt as number,
    status: response.Status as FormSubmissionStatus,
    confirmationCode: response.ConfirmationCode as string,
    answers: response.FormSubmission as string,
    checksum: response.FormSubmissionHash as string,
  };
}
