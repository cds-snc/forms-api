import { Request, Response, Router } from "express";

const router = Router({
  mergeParams: true,
});

router.put("/", async (request: Request, response: Response) => {
  response.json({
    formId: request.params.formId,
    submissionId: request.params.submissionId,
    confirmationCode: request.params.confirmationCode,
  });
});

export default router;
