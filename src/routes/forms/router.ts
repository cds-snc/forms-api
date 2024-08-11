import { Router } from "express";
import { submissionApiRoute } from "./submission/router";
import { authenticationMiddleware } from "../../middleware/authentication/middleware";
import { rateLimiterMiddleware } from "../../middleware/rateLimiter/middleware";

export const formsApiRoute = Router();

formsApiRoute
  .use(authenticationMiddleware)
  .use(rateLimiterMiddleware)
  .use("/:formId/submission", submissionApiRoute);
