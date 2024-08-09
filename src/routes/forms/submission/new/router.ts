import { Request, Response, Router } from "express";

const router = Router({
  mergeParams: true,
});

router.get("/", async (request: Request, response: Response) => {
  response.json({
    formId: request.params.formId,
  });
});

export default router;
