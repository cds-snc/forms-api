import { type Request, type Response, Router } from "express";

export const newApiRoute = Router({
  mergeParams: true,
});

newApiRoute.get("/", (request: Request, response: Response) => {
  response.json({
    formId: request.params.formId,
  });
});
