import { Router } from "express";
import getSubmission from "../lib/getSubmission";

export const route = Router();

route.get("/:formId/submission/:submissionId", async (req, res) => {
  const submissionId = req.params.submissionId;
  const response = await getSubmission(submissionId);
  res.send(response);
});
