import type { NextFunction, Request, Response } from "express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptResponse } from "@lib/encryption/encryptResponse.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";
import { FormSubmissionNotFoundException } from "@lib/vault/types/exceptions.js";
import { getFormSubmissionAttachment } from "@lib/vault/getFormSubmissionAttachment.js";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import { Readable } from "node:stream";
import type { FormSubmissionAttachment } from "@lib/vault/types/formSubmission.js";

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

    const responsePayload = { ...formSubmission, attachments };

    const serviceAccountPublicKey = await getPublicKey(serviceAccountId);

    const encryptedResponse = encryptResponse(
      serviceAccountPublicKey,
      JSON.stringify(responsePayload),
    );

    auditLog(
      serviceUserId,
      { type: "Response", id: submissionName },
      "DownloadResponse",
    );

    const responseAsBuffer = Buffer.from(JSON.stringify(encryptedResponse));
    const responseAsStream = Readable.from(responseAsBuffer);

    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Content-Length", responseAsBuffer.length);
    responseAsStream.pipe(response);
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
): Promise<FormSubmissionAttachment[]> {
  return Promise.all(
    paths.map((path) => {
      return getFormSubmissionAttachment(path);
    }),
  );
}

export const retrieveSubmissionOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
