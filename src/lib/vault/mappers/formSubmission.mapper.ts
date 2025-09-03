import { logMessage } from "@lib/logging/logger.js";
import {
  type NewFormSubmission,
  type FormSubmission,
  SubmissionStatus,
  type PartialAttachment,
  AttachmentScanStatus,
} from "@lib/vault/types/formSubmission.types.js";

export function mapNewFormSubmissionFromDynamoDbResponse(
  response: Record<string, unknown>,
): NewFormSubmission {
  try {
    if (response.Name === undefined || response.CreatedAt === undefined) {
      throw new Error("Missing key properties in DynamoDB response");
    }

    if (
      typeof response.Name !== "string" ||
      typeof response.CreatedAt !== "number"
    ) {
      throw new Error("Unexpected type in DynamoDB response");
    }

    return {
      name: response.Name,
      createdAt: response.CreatedAt,
    };
  } catch (error) {
    logMessage.info(
      error,
      "[mapper] Failed to map new form submission from DynamoDB response",
    );

    throw error;
  }
}

export function mapFormSubmissionFromDynamoDbResponse(
  response: Record<string, unknown>,
): FormSubmission {
  try {
    if (
      response.CreatedAt === undefined ||
      response["Status#CreatedAt"] === undefined ||
      response.ConfirmationCode === undefined ||
      response.FormSubmission === undefined ||
      response.FormSubmissionHash === undefined
      // response.SubmissionAttachments could be undefined if API users are retrieving responses that have been created before we implemented the submission attachments feature
    ) {
      throw new Error("Missing key properties in DynamoDB response");
    }

    if (
      typeof response.CreatedAt !== "number" ||
      typeof response["Status#CreatedAt"] !== "string" ||
      typeof response.ConfirmationCode !== "string" ||
      typeof response.FormSubmission !== "string" ||
      typeof response.FormSubmissionHash !== "string" ||
      (response.SubmissionAttachments !== undefined &&
        typeof response.SubmissionAttachments !== "string")
    ) {
      throw new Error("Unexpected type in DynamoDB response");
    }

    return {
      createdAt: response.CreatedAt,
      status: submissionStatusFromStatusCreatedAt(response["Status#CreatedAt"]),
      confirmationCode: response.ConfirmationCode,
      answers: response.FormSubmission,
      checksum: response.FormSubmissionHash,
      attachments: response.SubmissionAttachments
        ? partialAttachmentFromSubmissionAttachmentsAsJson(
            response.SubmissionAttachments,
          )
        : [],
    };
  } catch (error) {
    logMessage.info(
      error,
      "[mapper] Failed to map form submission from DynamoDB response",
    );

    throw error;
  }
}

function submissionStatusFromStatusCreatedAt(
  statusCreatedAtValue: string,
): SubmissionStatus {
  const status = statusCreatedAtValue.split("#").shift();

  switch (status) {
    case "New":
      return SubmissionStatus.New;
    case "Downloaded":
      return SubmissionStatus.Downloaded;
    case "Confirmed":
      return SubmissionStatus.Confirmed;
    case "Problem":
      return SubmissionStatus.Problem;
    default:
      throw new Error(
        `Unsupported Status#CreatedAt value. Value = ${statusCreatedAtValue}.`,
      );
  }
}

function partialAttachmentFromSubmissionAttachmentsAsJson(
  submissionAttachmentsAsJson: string,
): PartialAttachment[] {
  const attachments: Record<string, unknown>[] = JSON.parse(
    submissionAttachmentsAsJson,
  );

  return attachments.map((item) => {
    if (
      item.name === undefined ||
      item.path === undefined ||
      item.scanStatus === undefined
    ) {
      throw new Error("Missing key properties in submission attachment JSON");
    }

    if (
      typeof item.id !== "string" || typeof item.id !== "undefined" ||
      typeof item.name !== "string" ||
      typeof item.path !== "string" ||
      typeof item.scanStatus !== "string"
    ) {
      throw new Error("Unexpected type in submission attachment JSON");
    }

    return {
      id: item.id,
      name: item.name,
      path: item.path,
      scanStatus: attachmentScanStatusFromScanStatus(item.scanStatus),
    };
  });
}

function attachmentScanStatusFromScanStatus(
  scanStatus: string,
): AttachmentScanStatus {
  switch (scanStatus) {
    case "NO_THREATS_FOUND":
      return AttachmentScanStatus.NoThreatsFound;
    case "THREATS_FOUND":
      return AttachmentScanStatus.ThreatsFound;
    case "UNSUPPORTED":
      return AttachmentScanStatus.Unsupported;
    case "FAILED":
      return AttachmentScanStatus.Failed;
    default:
      throw new Error(`Unsupported scan status value. Value = ${scanStatus}.`);
  }
}
