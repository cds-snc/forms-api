import { Router } from "express";
import { submissionApiRoute } from "@routes/forms/submission/router";
import { authenticationMiddleware } from "@middleware/authentication/middleware";
import { rateLimiterMiddleware } from "@middleware/rateLimiter/middleware";

export const formsApiRoute = Router();

formsApiRoute
  .use(rateLimiterMiddleware)
  .use(
    "/:formId(c[a-z0-9]{24})/submission",
    authenticationMiddleware,
    submissionApiRoute,
  );
