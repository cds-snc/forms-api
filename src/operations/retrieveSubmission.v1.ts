import type { NextFunction, Request, Response } from "express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptResponse } from "@lib/encryption/encryptResponse.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";
import { FormSubmissionNotFoundException } from "@lib/vault/types/exceptions.js";
import { getFormSubmissionAttachmentContent } from "@lib/vault/getFormSubmissionAttachmentContent.js";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import type {
  FormSubmission,
  PartialSubmissionAttachment,
} from "@lib/vault/types/formSubmission.js";

type CompleteFormSubmissionAttachment = PartialSubmissionAttachment & {
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
      formSubmission.submissionAttachments.length > 0
        ? await getCompleteFormSubmissionAttachments(
            formSubmission.submissionAttachments,
          )
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
  partialAttachments: PartialSubmissionAttachment[],
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

function isAttachmentPotentiallyMalicious(scanStatus: string): boolean {
  switch (scanStatus) {
    case "NO_THREATS_FOUND":
      return false;
    case "THREATS_FOUND":
    case "UNSUPPORTED":
    case "FAILED":
      return true;
    default:
      throw new Error(
        `Unsupported attachment scan status value. Value = ${scanStatus}.`,
      );
  }
}

export const retrieveSubmissionOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
