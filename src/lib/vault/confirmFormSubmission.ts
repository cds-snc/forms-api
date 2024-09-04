import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionNotFoundException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@lib/vault/dataStructures/exceptions";

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

    await AwsServicesConnector.getInstance().dynamodbClient.send(
      new UpdateCommand({
        TableName: "Vault",
        Key: {
          FormID: formId,
          NAME_OR_CONF: `NAME#${submissionName}`,
        },
        /**
         * An update operation will insert a new item in DynamoDB if the targeted one does not exist. Since this is not what we want to happen
         * with the confirm operation, we are adding a `attribute_exists` check. This way, if no item was found with the composite primary key
         * the condition will fail as no `Status` property will be found.
         *
         * Also, we only allow the update to be applied if the form submission is not already confirmed and the confirmation code is the right one.
         */
        ConditionExpression:
          "attribute_exists(#status) AND #status <> :status AND ConfirmationCode = :confirmationCode",
        UpdateExpression:
          "SET #status = :status, ConfirmTimestamp = :confirmTimestamp, RemovalDate = :removalDate",
        ExpressionAttributeNames: {
          "#status": "Status",
        },
        ExpressionAttributeValues: {
          ":status": "Confirmed",
          ":confirmationCode": confirmationCode,
          ":confirmTimestamp": confirmationTimestamp,
          ":removalDate": removalDate,
        },
        ReturnValuesOnConditionCheckFailure: "ALL_OLD",
      }),
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      handleConditionalCheckFailedException(error, confirmationCode);
    }

    console.error(
      `[dynamodb] Failed to confirm form submission. FormId: ${formId} / SubmissionName: ${submissionName} / ConfirmationCode: ${confirmationCode}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}

function handleConditionalCheckFailedException(
  exception: ConditionalCheckFailedException,
  confirmationCode: string,
): void {
  const failedToBeUpdatedItem = exception.Item
    ? {
        status: exception.Item.Status.S as string,
        confirmationCode: exception.Item.ConfirmationCode.S as string,
      }
    : undefined;

  if (failedToBeUpdatedItem === undefined) {
    throw new FormSubmissionNotFoundException();
  }

  if (failedToBeUpdatedItem.status === "Confirmed") {
    throw new FormSubmissionAlreadyConfirmedException();
  }

  if (failedToBeUpdatedItem.confirmationCode !== confirmationCode) {
    throw new FormSubmissionIncorrectConfirmationCodeException();
  }
}
