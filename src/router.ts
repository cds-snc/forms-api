import { Router } from "express";
import { formsApiRoute } from "@routes/forms/router";
import { statusApiRoute } from "@routes/status/router";
import { routeNotFoundMiddleware } from "@middleware/routeNotFound/middleware";
import { globalErrorHandlerMiddleware } from "@middleware/globalErrorHandler/middleware";

export const router = Router();

router
  .use("/forms", formsApiRoute)
  .use("/status", statusApiRoute)
  // 404: Catches all unmatched routes
  .use(routeNotFoundMiddleware)
  // 500: Catches all unhandled errors from non async functions and errors passed through next() in async functions
  .use(globalErrorHandlerMiddleware);
