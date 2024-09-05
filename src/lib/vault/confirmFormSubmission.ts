import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionNotFoundException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@lib/vault/dataStructures/exceptions";
import { getFormSubmission } from "@lib/vault/getFormSubmission";
import { FormSubmissionStatus } from "@lib/vault/dataStructures/formSubmission";

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

    if (formSubmission === undefined) {
      throw new FormSubmissionNotFoundException();
    }

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
          "SET #status = :status, #statusCreatedAtKey = :statusCreatedAtValue, ConfirmTimestamp = :confirmTimestamp, RemovalDate = :removalDate",
        ExpressionAttributeNames: {
          "#status": "Status",
          "#statusCreatedAtKey": "Status#CreatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "Confirmed",
          ":statusCreatedAtValue": `Confirmed#${formSubmission.createdAt}`,
          ":confirmTimestamp": confirmationTimestamp,
          ":removalDate": removalDate,
        },
      }),
    );
  } catch (error) {
    console.error(
      `[dynamodb] Failed to confirm form submission. FormId: ${formId} / SubmissionName: ${submissionName} / ConfirmationCode: ${confirmationCode}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}
