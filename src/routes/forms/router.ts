import { Router } from "express";
import { submissionApiRoute } from "@routes/forms/submission/router.js";
import { authenticationMiddleware } from "@middleware/authentication/middleware.js";
import { rateLimiterMiddleware } from "@middleware/rateLimiter/middleware.js";

export const formsApiRoute = Router();

formsApiRoute
  .use(rateLimiterMiddleware)
  .use("/:formId(c[a-z0-9]{24})/submission", authenticationMiddleware, submissionApiRoute);
