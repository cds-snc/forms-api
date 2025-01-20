import { Router } from "express";
import { routeNotFoundMiddleware } from "@middleware/routeNotFound.js";
import { globalErrorHandlerMiddleware } from "@middleware/globalErrorHandler.js";
import { authenticationMiddleware } from "@middleware/authentication.js";
import { rateLimiterMiddleware } from "@middleware/rateLimiter.js";
import { checkServiceHealthOperation } from "@operations/checkServiceHealth.js";
import { retrieveTemplateOperation } from "@operations/retrieveTemplate.js";
import { retrieveNewSubmissionsOperation } from "@operations/retrieveNewSubmissions.js";
import { retrieveSubmissionOperation } from "@operations/retrieveSubmission.js";
import { confirmSubmissionOperation } from "@operations/confirmSubmission.js";
import { reportSubmissionOperation } from "@operations/reportSubmission.js";
import { versionMiddleware } from "@middleware/version.js";

import type {
  ApiOperation,
  OperationHandler,
} from "@operations/types/operation.js";

// Router configuration to inherit from parent router params
const INHERIT_PARAMS = { mergeParams: true };

export function buildRouter(): Router {
  const templateRoute = Router(INHERIT_PARAMS).get(
    "/",
    versionMiddleware(1),
    operationHandler(retrieveTemplateOperation.v1),
  );

  const newRoute = Router(INHERIT_PARAMS).get(
    "/",
    versionMiddleware(1),
    operationHandler(retrieveNewSubmissionsOperation.v1),
  );

  const confirmRoute = Router(INHERIT_PARAMS).put(
    "/:confirmationCode([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})",
    versionMiddleware(1),
    operationHandler(confirmSubmissionOperation.v1),
  );

  const problemRoute = Router(INHERIT_PARAMS).post(
    "/",
    versionMiddleware(1),
    operationHandler(reportSubmissionOperation.v1),
  );

  const submissionNameRoute = Router(INHERIT_PARAMS)
    .use("/confirm", confirmRoute)
    .use("/problem", problemRoute)
    .get(
      "/",
      versionMiddleware(1),
      operationHandler(retrieveSubmissionOperation.v1),
    );

  const submissionRoute = Router(INHERIT_PARAMS)
    .use("/new", newRoute)
    .use(
      "/:submissionName([0-9]{2}-[0-9]{2}-[a-z0-9]{4})",
      submissionNameRoute,
    );

  const formIdRoute = Router(INHERIT_PARAMS)
    .use("/template", templateRoute)
    .use("/submission", submissionRoute);

  const formsRoute = Router(INHERIT_PARAMS).use(
    "/:formId(c[a-z0-9]{24})",
    authenticationMiddleware,
    rateLimiterMiddleware,
    formIdRoute,
  );

  const statusRoute = Router().get(
    "/",
    operationHandler(checkServiceHealthOperation),
  );

  const router = Router()
    .use("/:version(v[0-9]{1,2})?/forms", formsRoute)
    .use("/status", statusRoute)
    // 404: Catches all unmatched routes
    .use(routeNotFoundMiddleware)
    // 500: Catches all unhandled errors from non async functions and errors passed through next() in async functions
    .use(globalErrorHandlerMiddleware);

  return router;
}

function operationHandler(operation: ApiOperation): OperationHandler[] {
  return operation.middleware.concat(operation.handler);
}
