import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/connectors/awsServicesConnector.js";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@lib/vault/dataStructures/exceptions.js";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { FormSubmissionStatus } from "@lib/vault/dataStructures/formSubmission.js";
import { logMessage } from "@lib/logger.js";

export async function reportProblemWithFormSubmission(
  formId: string,
  submissionName: string,
): Promise<void> {
  try {
    const formSubmission = await getFormSubmission(formId, submissionName);

    if (formSubmission === undefined) {
      throw new FormSubmissionNotFoundException();
    }

    if (formSubmission.status === FormSubmissionStatus.Problem) {
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
          "SET #status = :status, #statusCreatedAtKey = :statusCreatedAtValue, ProblemTimestamp = :problemTimestamp REMOVE RemovalDate",
        ExpressionAttributeNames: {
          "#status": "Status",
          "#statusCreatedAtKey": "Status#CreatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "Problem",
          ":statusCreatedAtValue": `Problem#${formSubmission.createdAt}`,
          ":problemTimestamp": Date.now(),
        },
      }),
    );
  } catch (error) {
    logMessage.error(
      `[dynamodb] Failed to report problem with form submission. FormId: ${formId} / SubmissionName: ${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}
