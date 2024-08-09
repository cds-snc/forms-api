import { Request, Response, Router } from "express";
import confirmRouter from "./confirm/router";
import getSubmission from "../../../../lib/vault/getSubmission";

const router = Router({
  mergeParams: true,
});

router.get("/", async (request: Request, response: Response) => {
  const formId = request.params.formId;
  const submissionId = request.params.submissionId;
  const submission = await getSubmission(formId, submissionId);
  response.json(submission);
});

router.use("/confirm", confirmRouter);

export default router;
