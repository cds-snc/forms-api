import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { VAULT_FILE_STORAGE_BUCKET_NAME } from "@config";
import { logMessage } from "@lib/logging/logger.js";

export async function getFormSubmissionAttachmentContent(
  path: string,
): Promise<{ base64EncodedContent: string }> {
  try {
    const response = await AwsServicesConnector.getInstance().s3Client.send(
      new GetObjectCommand({
        Bucket: VAULT_FILE_STORAGE_BUCKET_NAME,
        Key: path,
      }),
    );

    if (response.Body === undefined) {
      throw new Error("Attachment could not be found");
    }

    const objectAsByteArray = await response.Body.transformToByteArray();

    return {
      base64EncodedContent: Buffer.from(objectAsByteArray).toString("base64"),
    };
  } catch (error) {
    logMessage.info(
      error,
      `[s3] Failed to retrieve form submission attachment content. Path: ${path}.`,
    );

    throw error;
  }
}
