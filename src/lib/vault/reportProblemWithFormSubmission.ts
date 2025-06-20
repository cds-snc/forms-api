import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { FormSubmissionAlreadyReportedAsProblematicException } from "@lib/vault/types/exceptions.types.js";
import { SubmissionStatus } from "@lib/vault/types/formSubmission.types.js";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { logMessage } from "@lib/logging/logger.js";

export async function reportProblemWithFormSubmission(
  formId: string,
  submissionName: string,
): Promise<void> {
  try {
    const formSubmission = await getFormSubmission(formId, submissionName);

    if (formSubmission.status === SubmissionStatus.Problem) {
      throw new FormSubmissionAlreadyReportedAsProblematicException();
    }

    await AwsServicesConnector.getInstance().dynamodbClient.send(
      new UpdateCommand({
        TableName: "Vault",
        Key: {
          FormID: formId,
          NAME_OR_CONF: `NAME#${submissionName}`,
        },
        UpdateExpression:
          "SET #statusCreatedAtKey = :statusCreatedAtValue, ProblemTimestamp = :problemTimestamp REMOVE RemovalDate",
        ExpressionAttributeNames: {
          "#statusCreatedAtKey": "Status#CreatedAt",
        },
        ExpressionAttributeValues: {
          ":statusCreatedAtValue": `Problem#${formSubmission.createdAt}`,
          ":problemTimestamp": Date.now(),
        },
      }),
    );
  } catch (error) {
    logMessage.info(
      error,
      `[dynamodb] Failed to report problem with form submission. FormId: ${formId} / SubmissionName: ${submissionName}`,
    );

    throw error;
  }
}
