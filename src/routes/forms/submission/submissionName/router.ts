import { type Request, type Response, Router } from "express";
import { confirmApiRoute } from "@src/routes/forms/submission/submissionName/confirm/router";
import { getFormSubmission } from "@lib/vault/getFormSubmission";
import { FormSubmissionStatus } from "@src/lib/vault/dataStructures/formSubmission";

export const submissionNameApiRoute = Router({
  mergeParams: true,
});

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
          .json({ error: "Requested form submission does not exist" });
      }

      if (formSubmission.status === FormSubmissionStatus.New) {
        return response.status(403).json({
          error:
            "Requested form submission can't be retrieved because it is a new one",
        });
      }

      return response.json(formSubmission);
    } catch (error) {
      console.error(
        `[route] Internal error while serving request: /forms/${formId}/submission/${submissionName}. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
        )}`,
      );
      return response.sendStatus(500);
    }
  },
);

submissionNameApiRoute.use("/confirm", confirmApiRoute);
