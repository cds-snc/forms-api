import express, { type Request, type Response, Router } from "express";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@src/lib/vault/dataStructures/exceptions.js";
import { reportProblemWithFormSubmission } from "@src/lib/vault/reportProblemWithFormSubmission.js";
import { notifySupportAboutFormSubmissionProblem } from "@src/lib/support/notifySupportAboutFormSubmissionProblem.js";
import type { Schema } from "express-validator";
import { requestValidatorMiddleware } from "@src/middleware/requestValidator/middleware.js";
import { ENVIRONMENT_MODE, EnvironmentMode } from "@src/config.js";
import { logMessage } from "@src/lib/logger.js";
import { logEvent } from "@src/lib/auditLogs.js";

export const problemApiRoute = Router({
  mergeParams: true,
});

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

problemApiRoute.post(
  "/",
  express.json(),
  requestValidatorMiddleware(validationSchema, ["body"]),
  async (request: Request, response: Response) => {
    const formId = request.params.formId;
    const submissionName = request.params.submissionName;
    const username = request.username;

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
        username,
        { type: "Response", id: submissionName },
        "IdentifyProblemResponse",
      );
      return response.sendStatus(200);
    } catch (error) {
      if (error instanceof FormSubmissionNotFoundException) {
        return response
          .status(404)
          .json({ error: "Form submission does not exist" });
      }

      if (
        error instanceof FormSubmissionAlreadyReportedAsProblematicException
      ) {
        return response
          .status(200)
          .json({ info: "Form submission is already reported as problematic" });
      }

      logMessage.error(
        `[route] Internal error while serving request: /forms/${formId}/submission/${submissionName}/problem. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
        )}`,
      );

      return response.sendStatus(500);
    }
  },
);
