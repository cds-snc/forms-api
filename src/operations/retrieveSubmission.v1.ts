import type { NextFunction, Request, Response } from "express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptFormSubmission } from "@lib/encryption/encryptFormSubmission.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

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

    if (formSubmission === undefined) {
      response.status(404).json({ error: "Form submission does not exist" });
      return;
    }

    const encryptedFormSubmission = await encryptFormSubmission(
      serviceAccountId,
      formSubmission,
    );

    auditLog(
      serviceUserId,
      { type: "Response", id: submissionName },
      "DownloadResponse",
    );

    response.json(encryptedFormSubmission);
  } catch (error) {
    next(
      new Error(
        `[operation] Internal error while retrieving submission. Params: formId = ${formId} ; submissionName = ${submissionName}`,
        { cause: error },
      ),
    );
  }
}

export const retrieveSubmissionOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
