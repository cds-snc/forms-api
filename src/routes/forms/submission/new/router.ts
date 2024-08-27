import { getNewFormSubmissions } from "@src/lib/vault/getNewFormSubmissions";
import { type Request, type Response, Router } from "express";

export const newApiRoute = Router({
  mergeParams: true,
});

newApiRoute.get("/", async (request: Request, response: Response) => {
  const formId = request.params.formId;

  try {
    const newFormSubmissions = await getNewFormSubmissions(formId);

    return response.json(newFormSubmissions);
  } catch (error) {
    console.error(
      `[route] Internal error while serving request: /forms/${formId}/submission/new. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );
    return response.sendStatus(500);
  }
});