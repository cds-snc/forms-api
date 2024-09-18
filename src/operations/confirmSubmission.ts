import type { Request, Response } from "express";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionNotFoundException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@lib/vault/types/exceptions.js";
import { confirmFormSubmission } from "@lib/vault/confirmFormSubmission.js";
import { logMessage } from "@lib/logging/logger.js";
import { logEvent } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

async function main(request: Request, response: Response): Promise<void> {
  const formId = request.params.formId;
  const submissionName = request.params.submissionName;
  const confirmationCode = request.params.confirmationCode;
  const serviceUserId = request.serviceUserId;

  try {
    await confirmFormSubmission(formId, submissionName, confirmationCode);

    logEvent(
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
        logMessage.error(
          `[operation] Internal error while confirming submission. Params: formId = ${formId} ; submissionName = ${submissionName} ; confirmationCode = ${confirmationCode}. Reason: ${JSON.stringify(
            error,
            Object.getOwnPropertyNames(error),
          )}`,
        );

        response.sendStatus(500);
        break;
      }
    }
  }
}

export const confirmSubmissionOperation: ApiOperation = {
  middleware: [],
  handler: main,
};
