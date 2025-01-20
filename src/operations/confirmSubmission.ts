import type { NextFunction, Request, Response } from "express";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionNotFoundException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@lib/vault/types/exceptions.js";
import { confirmFormSubmission } from "@lib/vault/confirmFormSubmission.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

async function v1(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const formId = request.params.formId;
  const submissionName = request.params.submissionName;
  const confirmationCode = request.params.confirmationCode;
  const serviceUserId = request.serviceUserId;

  try {
    await confirmFormSubmission(formId, submissionName, confirmationCode);

    auditLog(
      serviceUserId,
      { type: "Response", id: submissionName },
      "ConfirmResponse",
    );

    response.sendStatus(200);
  } catch (error) {
    switch ((error as Error).constructor) {
      case FormSubmissionNotFoundException:
        response.status(404).json({ error: "Form submission does not exist" });
        break;
      case FormSubmissionAlreadyConfirmedException:
        response
          .status(200)
          .json({ info: "Form submission is already confirmed" });
        break;
      case FormSubmissionIncorrectConfirmationCodeException:
        response.status(400).json({ error: "Confirmation code is incorrect" });
        break;
      default: {
        next(
          new Error(
            `[operation] Internal error while confirming submission. Params: formId = ${formId} ; submissionName = ${submissionName} ; confirmationCode = ${confirmationCode}`,
            { cause: error },
          ),
        );
        break;
      }
    }
  }
}

export const confirmSubmissionOperation: Record<string, ApiOperation> = {
  v1: {
    middleware: [],
    handler: v1,
  },
};
