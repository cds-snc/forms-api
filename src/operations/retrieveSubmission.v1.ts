import type { NextFunction, Request, Response } from "express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptResponsePayload } from "@lib/encryption/encryptResponsePayload.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";
import { getFormSubmissionAttachment } from "@lib/vault/getFormSubmissionAttachment.js";
import { FormSubmissionNotFoundException } from "@lib/vault/types/exceptions.js";

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

    const attachmentPaths = extractAttachmentPathsFromSubmissionAnswers(
      formSubmission.answers,
    );

    const attachments =
      attachmentPaths.length > 0
        ? await getFormSubmissionAttachments(attachmentPaths)
        : undefined;

    const responsePayload = { ...formSubmission, ...attachments };

    const encryptedResponsePayload = await encryptResponsePayload(
      serviceAccountId,
      responsePayload,
    );

    auditLog(
      serviceUserId,
      { type: "Response", id: submissionName },
      "DownloadResponse",
    );

    response.json(encryptedResponsePayload);
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

function extractAttachmentPathsFromSubmissionAnswers(
  answers: string,
): string[] {
  const attachmentRegex =
    /form_attachments\/\d{4}-\d{2}-\d{2}\/[a-f0-9\-]+\/[^\/]+\.[a-zA-Z0-9.]+/g;

  return answers
    .matchAll(attachmentRegex)
    .map((result) => result[0])
    .toArray();
}

function getFormSubmissionAttachments(
  paths: string[],
): Promise<{ name: string; content: string }[]> {
  const getAttachmentOperations = paths.map((path) => {
    return getFormSubmissionAttachment(path).then((attachment) => {
      if (attachment === undefined) {
        throw new Error(`Could not find attachment ${path}`);
      }

      const attachmentName = path.split("/").pop();

      if (attachmentName === undefined) {
        throw new Error(`Attachment name in ${path} is undefined`);
      }

      return {
        name: attachmentName,
        content: attachment,
      };
    });
  });

  return Promise.all(getAttachmentOperations);
}

export const retrieveSubmissionOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
