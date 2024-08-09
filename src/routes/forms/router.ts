import { Router } from "express";
import submissionRouter from "./submission/router";
import authenticationMiddleware from "../../middleware/authentication/middleware";
import rateLimiterMiddleware from "../../middleware/rateLimiter/middleware";

const router = Router();

router
  .use(authenticationMiddleware)
  .use(rateLimiterMiddleware)
  .use("/:formId/submission", submissionRouter);

export default router;
