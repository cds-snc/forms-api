import { type Request, type Response, Router } from "express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptFormSubmission } from "@src/lib/vault/encryptFormSubmission.js";
import { logMessage } from "@src/lib/logger.js";
import { confirmApiRoute } from "@routes/forms/submission/submissionName/confirm/router.js";
import { problemApiRoute } from "@routes/forms/submission/submissionName/problem/router.js";

export const submissionNameApiRoute = Router({
  mergeParams: true,
});

submissionNameApiRoute.use("/confirm", confirmApiRoute);
submissionNameApiRoute.use("/problem", problemApiRoute);

submissionNameApiRoute.get(
  "/",
  async (request: Request, response: Response) => {
    const formId = request.params.formId;
    const submissionName = request.params.submissionName;

    try {
      const formSubmission = await getFormSubmission(formId, submissionName);

      if (formSubmission === undefined) {
        return response
          .status(404)
          .json({ error: "Form submission does not exist" });
      }

      const serviceAccountId = request.serviceAccountId;
      if (!serviceAccountId) {
        throw new Error(
          `Service Account ID not found in request when trying to download form submission ${submissionName} for form ${formId}`,
        );
      }

      const encryptedSubmission = await encryptFormSubmission(
        serviceAccountId,
        formSubmission,
      );

      return response.json(encryptedSubmission);
    } catch (error) {
      logMessage.error(
        `[route] Internal error while serving request: /forms/${formId}/submission/${submissionName}. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
        )}`,
      );

      return response.sendStatus(500);
    }
  },
);
