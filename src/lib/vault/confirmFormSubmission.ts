import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@lib/vault/types/exceptions.js";
import { FormSubmissionStatus } from "@lib/vault/types/formSubmission.js";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { logMessage } from "@lib/logging/logger.js";

const REMOVAL_DATE_DELAY_IN_DAYS = 30;

export async function confirmFormSubmission(
  formId: string,
  submissionName: string,
  confirmationCode: string,
): Promise<void> {
  try {
    const confirmationTimestamp = Date.now();
    const removalDate =
      confirmationTimestamp + REMOVAL_DATE_DELAY_IN_DAYS * 86400000;

    const formSubmission = await getFormSubmission(formId, submissionName);

    if (formSubmission.status === FormSubmissionStatus.Confirmed) {
      throw new FormSubmissionAlreadyConfirmedException();
    }

    if (formSubmission.confirmationCode !== confirmationCode) {
      throw new FormSubmissionIncorrectConfirmationCodeException();
    }

    await AwsServicesConnector.getInstance().dynamodbClient.send(
      new UpdateCommand({
        TableName: "Vault",
        Key: {
          FormID: formId,
          NAME_OR_CONF: `NAME#${submissionName}`,
        },
        UpdateExpression:
          "SET #statusCreatedAtKey = :statusCreatedAtValue, ConfirmTimestamp = :confirmTimestamp, RemovalDate = :removalDate",
        ExpressionAttributeNames: {
          "#statusCreatedAtKey": "Status#CreatedAt",
        },
        ExpressionAttributeValues: {
          ":statusCreatedAtValue": `Confirmed#${formSubmission.createdAt}`,
          ":confirmTimestamp": confirmationTimestamp,
          ":removalDate": removalDate,
        },
      }),
    );
  } catch (error) {
    logMessage.info(
      error,
      `[dynamodb] Failed to confirm form submission. FormId: ${formId} / SubmissionName: ${submissionName} / ConfirmationCode: ${confirmationCode}`,
    );

    throw error;
  }
}
