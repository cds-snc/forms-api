import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AwsServicesConnector } from "@lib/awsServicesConnector";
import { FormSubmissionNotFoundException } from "./dataStructures/exceptions";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

export async function reportProblemWithFormSubmission(
  formId: string,
  submissionName: string,
): Promise<void> {
  try {
    await AwsServicesConnector.getInstance().dynamodbClient.send(
      new UpdateCommand({
        TableName: "Vault",
        Key: {
          FormID: formId,
          NAME_OR_CONF: `NAME#${submissionName}`,
        },
        /**
         * An update operation will insert a new item in DynamoDB if the targeted one does not exist. Since this is not what we want to happen
         * with the report problem operation, we are adding a `attribute_exists` check. This way, if no item was found with the composite primary key
         * the condition will fail as no `Status` property will be found.
         */
        ConditionExpression: "attribute_exists(#status)",
        UpdateExpression:
          "SET #status = :status, ProblemTimestamp = :problemTimestamp REMOVE RemovalDate",
        ExpressionAttributeNames: {
          "#status": "Status",
        },
        ExpressionAttributeValues: {
          ":status": "Problem",
          ":problemTimestamp": Date.now(),
        },
        ReturnValuesOnConditionCheckFailure: "NONE",
      }),
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      throw new FormSubmissionNotFoundException();
    }

    console.error(
      `[dynamodb] Failed to report problem with form submission. FormId: ${formId} / SubmissionName: ${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}
