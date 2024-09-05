import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@lib/vault/dataStructures/exceptions";
import { getFormSubmission } from "@lib/vault/getFormSubmission";
import { FormSubmissionStatus } from "@lib/vault/dataStructures/formSubmission";

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
          "SET #status = :status, #statusCreatedAtKey = :statusCreatedAtKeyValue, ProblemTimestamp = :problemTimestamp REMOVE RemovalDate",
        ExpressionAttributeNames: {
          "#status": "Status",
          "#statusCreatedAtKey": "Status#CreatedAt",
        },
        ExpressionAttributeValues: {
          ":status": "Problem",
          ":statusCreatedAtKeyValue": `Problem#${formSubmission.createdAt}`,
          ":problemTimestamp": Date.now(),
        },
      }),
    );
  } catch (error) {
    console.error(
      `[dynamodb] Failed to report problem with form submission. FormId: ${formId} / SubmissionName: ${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}
