import { confirmFormSubmission } from "@src/lib/vault/confirmFormSubmission";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionNotFoundException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@src/lib/vault/dataStructures/exceptions";
import { type Request, type Response, Router } from "express";

export const confirmApiRoute = Router({
  mergeParams: true,
});

confirmApiRoute.put(
  "/:confirmationCode([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})",
  async (request: Request, response: Response) => {
    const formId = request.params.formId;
    const submissionName = request.params.submissionName;
    const confirmationCode = request.params.confirmationCode;

    try {
      await confirmFormSubmission(formId, submissionName, confirmationCode);
      return response.sendStatus(200);
    } catch (error) {
      if (error instanceof FormSubmissionNotFoundException) {
        return response
          .status(404)
          .json({ error: "Form submission does not exist" });
      }

      if (error instanceof FormSubmissionAlreadyConfirmedException) {
        return response
          .status(200)
          .json({ info: "Form submission is already confirmed" });
      }

      if (error instanceof FormSubmissionIncorrectConfirmationCodeException) {
        return response
          .status(400)
          .json({ error: "Confirmation code is incorrect" });
      }

      console.error(
        `[route] Internal error while serving request: /forms/${formId}/submission/${submissionName}/confirm/${confirmationCode}. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
        )}`,
      );

      return response.sendStatus(500);
    }
  },
);
