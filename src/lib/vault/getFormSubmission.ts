import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodbClient } from "@lib/awsServicesConnector";

interface FormSubmission {
  content: string;
}

export async function getFormSubmission(
  formId: string,
  submissionName: string,
): Promise<FormSubmission | undefined> {
  try {
    const response = await dynamodbClient.send(
      new GetCommand({
        // biome-ignore lint/style/useNamingConvention: <AWS variable naming convention is beyond our control>
        TableName: "Vault",
        // biome-ignore lint/style/useNamingConvention: <AWS variable naming convention is beyond our control>
        Key: { FormID: formId, NAME_OR_CONF: `NAME#${submissionName}` },
        // biome-ignore lint/style/useNamingConvention: <AWS variable naming convention is beyond our control>
        ProjectionExpression: "FormSubmission",
      })
    );

    if (response.Item === undefined) {
      return undefined;
    }

    return {
      content: response.Item.FormSubmission,
    };
  } catch (error) {
    console.error(
      `[dynamodb] Failed to retrieve form submission. FormId: ${formId} / SubmissionName: ${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );
    throw error;
  }
}
