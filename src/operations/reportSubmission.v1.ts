import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ENVIRONMENT_MODE, EnvironmentMode } from "@config";
import type { Schema } from "express-validator";
import { requestValidatorMiddleware } from "@middleware/requestValidator.js";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@lib/vault/types/exceptions.types.js";
import { reportProblemWithFormSubmission } from "@lib/vault/reportProblemWithFormSubmission.js";
import { notifySupportAboutFormSubmissionProblem } from "@lib/support/notifySupportAboutFormSubmissionProblem.js";
import { logMessage } from "@lib/logging/logger.js";
import { auditLog } from "@lib/logging/auditLogs.js";
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
      options: { min: 10, max: 1000 },
      errorMessage: "Text length must be between 10 and 1000 characters",
    },
    escape: true,
    isBase64: { negated: true },
  },
  preferredLanguage: {
    exists: { bail: true, errorMessage: "Missing preferredLanguage property" },
    isIn: { options: [["en", "fr"]], errorMessage: "Must be 'en' or 'fr'" },
  },
};

async function v1(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
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

    auditLog({
      userId: serviceUserId,
      subject: { type: "Response", id: submissionName },
      event: "IdentifyProblemResponse",
    });

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
        next(
          new Error(
            `[operation] Internal error while reporting problem with submission: Params: formId = ${formId} ; submissionName = ${submissionName}`,
            { cause: error },
          ),
        );
        break;
      }
    }
  }
}

export const reportSubmissionOperationV1: ApiOperation = {
  middleware: [
    express.json(),
    requestValidatorMiddleware(validationSchema, ["body"]),
  ],
  handler: v1,
};
