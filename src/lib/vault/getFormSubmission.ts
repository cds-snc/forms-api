import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import {
  type FormSubmission,
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
            "CreatedAt,#statusCreatedAtKey,ConfirmationCode,FormSubmission,FormSubmissionHash",
          ExpressionAttributeNames: {
            "#statusCreatedAtKey": "Status#CreatedAt",
          },
        }),
      );

    if (response.Item === undefined) {
      return undefined;
    }

    return formSubmissionFromDynamoDbResponse(response.Item);
  } catch (error) {
    logMessage.info(
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
    status: formSubmissionStatusFromStatusCreatedAt(
      response["Status#CreatedAt"] as string,
    ),
    confirmationCode: response.ConfirmationCode as string,
    answers: response.FormSubmission as string,
    checksum: response.FormSubmissionHash as string,
  };
}

function formSubmissionStatusFromStatusCreatedAt(
  statusCreatedAtValue: string,
): FormSubmissionStatus {
  const status = statusCreatedAtValue.split("#")[0];

  switch (status) {
    case "New":
      return FormSubmissionStatus.New;
    case "Downloaded":
      return FormSubmissionStatus.Downloaded;
    case "Confirmed":
      return FormSubmissionStatus.Confirmed;
    case "Problem":
      return FormSubmissionStatus.Problem;
    default:
      throw new Error(
        `Unsupported Status#CreatedAt value. Value = ${statusCreatedAtValue}.`,
      );
  }
}
