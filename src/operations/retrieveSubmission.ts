import type { Request, Response } from "express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptFormSubmission } from "@lib/encryption/encryptFormSubmission.js";
import { logMessage } from "@lib/logging/logger.js";
import { publishAuditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

async function main(request: Request, response: Response): Promise<void> {
  const formId = request.params.formId;
  const submissionName = request.params.submissionName;
  const serviceUserId = request.serviceUserId;
  const serviceAccountId = request.serviceAccountId;

  try {
    const formSubmission = await getFormSubmission(formId, submissionName);

    if (formSubmission === undefined) {
      response.status(404).json({ error: "Form submission does not exist" });
      return;
    }

    const encryptedFormSubmission = await encryptFormSubmission(
      serviceAccountId,
      formSubmission,
    );

    publishAuditLog(
      serviceUserId,
      { type: "Response", id: submissionName },
      "DownloadResponse",
    );

    response.json(encryptedFormSubmission);
  } catch (error) {
    logMessage.error(
      `[operation] Internal error while retrieving submission. Params: formId = ${formId} ; submissionName = ${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    response.sendStatus(500);
  }
}

export const retrieveSubmissionOperation: ApiOperation = {
  middleware: [],
  handler: main,
};
