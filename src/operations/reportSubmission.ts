import express, { type Request, type Response } from "express";
import { ENVIRONMENT_MODE, EnvironmentMode } from "@src/config.js";
import type { Schema } from "express-validator";
import { requestValidatorMiddleware } from "@src/middleware/requestValidator.js";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@lib/vault/types/exceptions.js";
import { reportProblemWithFormSubmission } from "@lib/vault/reportProblemWithFormSubmission.js";
import { notifySupportAboutFormSubmissionProblem } from "@lib/support/notifySupportAboutFormSubmissionProblem.js";
import { logMessage } from "@lib/logging/logger.js";
import { logEvent } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

const validationSchema: Schema = {
  contactEmail: {
    exists: { bail: true, errorMessage: "Missing contactEmail property" },
    isEmail: true,
  },
  description: {
    exists: { bail: true, errorMessage: "Missing description property" },
    isString: true,
    isLength: {
      options: { min: 10 },
      errorMessage: "Must be at least 10 characters long",
    },
    escape: true,
  },
  preferredLanguage: {
    exists: { bail: true, errorMessage: "Missing preferredLanguage property" },
    isIn: { options: [["en", "fr"]], errorMessage: "Must be 'en' or 'fr'" },
  },
};

async function main(request: Request, response: Response): Promise<void> {
  const formId = request.params.formId;
  const submissionName = request.params.submissionName;
  const serviceUserId = request.serviceUserId;

  const contactEmail = request.body.contactEmail as string;
  const description = request.body.description as string;
  const preferredLanguage = request.body.preferredLanguage as "en" | "fr";

  try {
    await reportProblemWithFormSubmission(formId, submissionName);

    if (ENVIRONMENT_MODE !== EnvironmentMode.Local) {
      await notifySupportAboutFormSubmissionProblem(
        formId,
        submissionName,
        contactEmail,
        description,
        preferredLanguage,
        ENVIRONMENT_MODE,
      );
    } else {
      logMessage.debug(
        "[local] Will not notify support about submission problem.",
      );
    }

    logEvent(
      serviceUserId,
      { type: "Response", id: submissionName },
      "IdentifyProblemResponse",
    );

    response.sendStatus(200);
  } catch (error) {
    switch ((error as Error).constructor) {
      case FormSubmissionNotFoundException:
        response.status(404).json({ error: "Form submission does not exist" });
        break;
      case FormSubmissionAlreadyReportedAsProblematicException:
        response
          .status(200)
          .json({ info: "Form submission is already reported as problematic" });
        break;
      default: {
        logMessage.error(
          `[operation] Internal error while reporting problem with submission: Params: formId = ${formId} ; submissionName = ${submissionName}. Reason: ${JSON.stringify(
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

export const reportSubmissionOperation: ApiOperation = {
  middleware: [
    express.json(),
    requestValidatorMiddleware(validationSchema, ["body"]),
  ],
  handler: main,
};
