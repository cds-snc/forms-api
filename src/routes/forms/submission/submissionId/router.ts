import { type Request, type Response, Router } from "express";
import { confirmApiRoute } from "./confirm/router";
import { getSubmission } from "../../../../lib/vault/getSubmission";

export const submissionIdApiRoute = Router({
  mergeParams: true,
});

submissionIdApiRoute.get("/", (request: Request, response: Response) => {
  const formId = request.params.formId;
  const submissionId = request.params.submissionId;
  const submission = getSubmission(formId, submissionId);
  response.json(submission);
});

submissionIdApiRoute.use("/confirm", confirmApiRoute);
