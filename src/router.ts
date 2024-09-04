import { Router } from "express";
import { formsApiRoute } from "@routes/forms/router.js";
import { statusApiRoute } from "@routes/status/router.js";
import { routeNotFoundMiddleware } from "@middleware/routeNotFound/middleware.js";
import { globalErrorHandlerMiddleware } from "@middleware/globalErrorHandler/middleware.js";

export const router = Router();

router
  .use("/forms", formsApiRoute)
  .use("/status", statusApiRoute)
  // 404: Catches all unmatched routes
  .use(routeNotFoundMiddleware)
  // 500: Catches all unhandled errors from non async functions and errors passed through next() in async functions
  .use(globalErrorHandlerMiddleware);
