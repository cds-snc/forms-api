import { type Request, type Response, Router } from "express";

export const confirmationCodeApiRoute = Router({
  mergeParams: true,
});

confirmationCodeApiRoute.put("/", (request: Request, response: Response) => {
  response.json({
    formId: request.params.formId,
    submissionId: request.params.submissionId,
    confirmationCode: request.params.confirmationCode,
  });
});
