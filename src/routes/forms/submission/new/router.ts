import { getFormNewSubmissions } from "@src/lib/vault/getFormNewSubmission";
import { type Request, type Response, Router } from "express";

export const newApiRoute = Router({
  mergeParams: true,
});

newApiRoute.get("/", async (request: Request, response: Response) => {
  const formId = request.params.formId;

  try {
    const formNewSubmissions = await getFormNewSubmissions(formId);

    if (formNewSubmissions === undefined) {
      return response
        .status(404)
        .json({ error: "No new form submissions found" });
    }

    return response.json(formNewSubmissions);
  } catch (error) {
    console.error(
      `[route] Internal error while serving request: /forms/${formId}/submission/${submissionName}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );
    return response.sendStatus(500);
  }
});
