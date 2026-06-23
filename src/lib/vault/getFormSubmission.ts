import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { logMessage } from "@lib/logging/logger.js";
import { mapFormSubmissionFromDynamoDbResponse } from "@lib/vault/mappers/formSubmission.mapper.js";
import { FormSubmissionNotFoundException } from "@lib/vault/types/exceptions.types.js";
import type { FormSubmission } from "@lib/vault/types/formSubmission.types.js";

export async function getFormSubmission(
  formId: string,
  submissionName: string,
): Promise<FormSubmission> {
  try {
    const response =
      await AwsServicesConnector.getInstance().dynamodbClient.send(
        new GetCommand({
          TableName: "Vault",
          Key: { FormID: formId, NAME_OR_CONF: `NAME#${submissionName}` },
          ProjectionExpression:
            "CreatedAt,#statusCreatedAtKey,ConfirmationCode,FormSubmission,FormSubmissionHash,SubmissionAttachments,Version",
          ExpressionAttributeNames: {
            "#statusCreatedAtKey": "Status#CreatedAt",
          },
        }),
      );

    if (response.Item === undefined) {
      throw new FormSubmissionNotFoundException();
    }

    return mapFormSubmissionFromDynamoDbResponse(response.Item);
  } catch (error) {
    logMessage.info(
      error,
      `[dynamodb] Failed to retrieve form submission. FormId: ${formId} / SubmissionName: ${submissionName}`,
    );

    throw error;
  }
}
