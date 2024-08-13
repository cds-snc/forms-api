import { type Request, type Response, Router } from "express";

export const confirmationCodeApiRoute = Router({
  mergeParams: true,
});

confirmationCodeApiRoute.put("/", (request: Request, response: Response) => {
  response.json({
    formId: request.params.formId,
    submissionName: request.params.submissionName,
    confirmationCode: request.params.confirmationCode,
  });
});
