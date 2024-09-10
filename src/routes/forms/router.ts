import { Router } from "express";
import { authenticationMiddleware } from "@middleware/authentication/middleware.js";
import { rateLimiterMiddleware } from "@middleware/rateLimiter/middleware.js";
import { formIdApiRoute } from "@routes/forms/formId/router.js";

export const formsApiRoute = Router();

formsApiRoute
  .use(rateLimiterMiddleware)
  .use("/:formId(c[a-z0-9]{24})", authenticationMiddleware, formIdApiRoute);
