import type { NextFunction, Request, Response } from "express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptResponse } from "@lib/encryption/encryptResponse.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";
import { FormSubmissionNotFoundException } from "@lib/vault/types/exceptions.types.js";
import { getFormSubmissionAttachmentContent } from "@lib/vault/getFormSubmissionAttachmentContent.js";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import {
  AttachmentScanStatus,
  type FormSubmission,
  type PartialAttachment,
} from "@lib/vault/types/formSubmission.types.js";

type CompleteFormSubmissionAttachment = PartialAttachment & {
  base64EncodedContent: string;
};

async function v1(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const formId = request.params.formId;
  const submissionName = request.params.submissionName;
  const serviceUserId = request.serviceUserId;
  const serviceAccountId = request.serviceAccountId;

  try {
    const formSubmission = await getFormSubmission(formId, submissionName);

    const attachments =
      formSubmission.attachments.length > 0
        ? await getCompleteFormSubmissionAttachments(formSubmission.attachments)
        : undefined;

    const responsePayload = buildJsonResponse(formSubmission, attachments);

    const serviceAccountPublicKey = await getPublicKey(serviceAccountId);

    const encryptedResponse = encryptResponse(
      serviceAccountPublicKey,
      responsePayload,
    );

    auditLog(
      serviceUserId,
      { type: "Response", id: submissionName },
      "DownloadResponse",
    );

    response.json(encryptedResponse);
  } catch (error) {
    switch ((error as Error).constructor) {
      case FormSubmissionNotFoundException:
        response.status(404).json({ error: "Form submission does not exist" });
        break;
      default: {
        next(
          new Error(
            `[operation] Internal error while retrieving submission. Params: formId = ${formId} ; submissionName = ${submissionName}`,
            { cause: error },
          ),
        );
        break;
      }
    }
  }
}

function getCompleteFormSubmissionAttachments(
  partialAttachments: PartialAttachment[],
): Promise<CompleteFormSubmissionAttachment[]> {
  return Promise.all(
    partialAttachments.map((partialAttachment) => {
      return getFormSubmissionAttachmentContent(partialAttachment.path).then(
        ({ base64EncodedContent }) => {
          return { ...partialAttachment, base64EncodedContent };
        },
      );
    }),
  );
}

function buildJsonResponse(
  formSubmission: FormSubmission,
  attachments: CompleteFormSubmissionAttachment[] | undefined,
): string {
  return JSON.stringify({
    createdAt: formSubmission.createdAt,
    status: formSubmission.status,
    confirmationCode: formSubmission.confirmationCode,
    answers: formSubmission.answers,
    checksum: formSubmission.checksum,
    ...(attachments && {
      attachments: attachments.map((attachment) => ({
        name: attachment.name,
        base64EncodedContent: attachment.base64EncodedContent,
        isPotentiallyMalicious: isAttachmentPotentiallyMalicious(
          attachment.scanStatus,
        ),
      })),
    }),
  });
}

function isAttachmentPotentiallyMalicious(
  scanStatus: AttachmentScanStatus,
): boolean {
  switch (scanStatus) {
    case AttachmentScanStatus.NoThreatsFound:
      return false;
    default:
      return true;
  }
}

export const retrieveSubmissionOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
