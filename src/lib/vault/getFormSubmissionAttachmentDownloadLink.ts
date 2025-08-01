import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { VAULT_FILE_STORAGE_BUCKET_NAME } from "@config";
import { logMessage } from "@lib/logging/logger.js";

export function getFormSubmissionAttachmentDownloadLink(
  path: string,
): Promise<string> {
  return getSignedUrl(
    AwsServicesConnector.getInstance().s3Client,
    new GetObjectCommand({
      Bucket: VAULT_FILE_STORAGE_BUCKET_NAME,
      Key: path,
    }),
    { expiresIn: 10 }, // 10 seconds
  ).catch((error) => {
    logMessage.info(
      error,
      `[s3] Failed to generate form submission attachment download link. Path: ${path}.`,
    );

    throw error;
  });
}
