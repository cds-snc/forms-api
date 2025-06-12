import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import {
  GetObjectCommand,
  GetObjectTaggingCommand,
  type Tag,
} from "@aws-sdk/client-s3";
import { VAULT_FILE_STORAGE_BUCKET_NAME } from "@config";
import { logMessage } from "@lib/logging/logger.js";
import type { FormSubmissionAttachment } from "@lib/vault/types/formSubmission.js";

export async function getFormSubmissionAttachment(
  path: string,
): Promise<FormSubmissionAttachment> {
  try {
    const attachmentName = path.split("/").pop();

    if (attachmentName === undefined) {
      throw new Error(`Attachment name is undefined. Path: ${path}.`);
    }

    const base64EncodedAttachment = await getBase64EncodedAttachment(path);

    if (base64EncodedAttachment === undefined) {
      throw new Error(`Attachment could not be found. Path: ${path}.`);
    }

    const attachmentTags = await getAttachmentTags(path);

    const malwareScanTag = attachmentTags?.find(
      (tag) => tag.Key === "GuardDutyMalwareScanStatus",
    );

    if (malwareScanTag === undefined || malwareScanTag.Value === undefined) {
      throw new Error(
        `Malware scan tag can't be exploited. Tag: ${malwareScanTag}.`,
      );
    }

    const isPotentiallyMalicious = isAttachmentPotentiallyMalicious(
      malwareScanTag.Value,
    );

    return {
      name: attachmentName,
      base64EncodedContent: base64EncodedAttachment,
      isPotentiallyMalicious,
    };
  } catch (error) {
    logMessage.info(
      error,
      `[s3] Failed to retrieve form submission attachment. Path: ${path}.`,
    );

    throw error;
  }
}

async function getBase64EncodedAttachment(
  key: string,
): Promise<string | undefined> {
  try {
    const response = await AwsServicesConnector.getInstance().s3Client.send(
      new GetObjectCommand({
        Bucket: VAULT_FILE_STORAGE_BUCKET_NAME,
        Key: key,
      }),
    );

    if (response.Body === undefined) {
      return undefined;
    }

    const objectAsByteArray = await response.Body.transformToByteArray();

    return Buffer.from(objectAsByteArray).toString("base64");
  } catch (error) {
    throw new Error(`Failed to retrieve attachment with key: ${key}.`, {
      cause: error,
    });
  }
}

async function getAttachmentTags(key: string): Promise<Tag[] | undefined> {
  return AwsServicesConnector.getInstance()
    .s3Client.send(
      new GetObjectTaggingCommand({
        Bucket: VAULT_FILE_STORAGE_BUCKET_NAME,
        Key: key,
      }),
    )
    .then((output) => output.TagSet)
    .catch((error) => {
      throw new Error(`Failed to retrieve attachment tags with key: ${key}.`, {
        cause: error,
      });
    });
}

function isAttachmentPotentiallyMalicious(malwareScanStatus: string): boolean {
  switch (malwareScanStatus) {
    case "NO_THREATS_FOUND":
      return false;
    case "THREATS_FOUND":
    case "UNSUPPORTED":
    case "FAILED":
      return true;
    default:
      throw new Error(
        `Unsupported malware scan status value. Value = ${malwareScanStatus}.`,
      );
  }
}
