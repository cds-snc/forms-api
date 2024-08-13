import { type Request, type Response, Router } from "express";

export const downloadedApiRoute = Router({
  mergeParams: true,
});

downloadedApiRoute.get("/", (request: Request, response: Response) => {
  response.json({
    formId: request.params.formId,
  });
});
