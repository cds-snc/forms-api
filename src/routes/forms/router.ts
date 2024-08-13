import { Router } from "express";
import submissionRouter from "./submission/router";
import authenticationMiddleware from "../../middleware/authentication/middleware";
import rateLimiterMiddleware from "../../middleware/rateLimiter/middleware";

const router = Router();

router
  .use(rateLimiterMiddleware)
  .use("/:formId/submission", authenticationMiddleware, submissionRouter);

export default router;
