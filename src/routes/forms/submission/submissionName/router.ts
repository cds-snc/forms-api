import { type Request, type Response, Router } from "express";
import { confirmApiRoute } from "@routes/forms/submission/submissionName/confirm/router";
import { getFormSubmission } from "@lib/vault/getFormSubmission";
import { problemApiRoute } from "@routes/forms/submission/submissionName/problem/router";

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
