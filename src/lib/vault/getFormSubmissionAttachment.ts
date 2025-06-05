import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { VAULT_FILE_STORAGE_BUCKET_NAME } from "@config";
import { logMessage } from "@lib/logging/logger.js";
import { FormSubmissionAttachmentNotFoundException } from "@lib/vault/types/exceptions.js";

export async function getFormSubmissionAttachment(
  path: string,
): Promise<string> {
  try {
    const response = await AwsServicesConnector.getInstance().s3Client.send(
      new GetObjectCommand({
        Bucket: VAULT_FILE_STORAGE_BUCKET_NAME,
        Key: path,
      }),
    );

    if (response.Body === undefined) {
      throw new FormSubmissionAttachmentNotFoundException();
    }

    const objectAsByteArray = await response.Body.transformToByteArray();

    return Buffer.from(objectAsByteArray).toString("base64");
  } catch (error) {
    logMessage.info(
      error,
      `[s3] Failed to retrieve form submission attachment. Path: ${path}`,
    );

    throw error;
  }
}
