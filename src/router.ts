import { Router } from "express";
import formsRouter from "./routes/forms/router";
import statusRouter from "./routes/status/router";
import routeNotFoundMiddleware from "./middleware/routeNotFound/middleware";
import globalErrorHandlerMiddleware from "./middleware/globalErrorHandler/middleware";

const router = Router();

router
  .use("/forms", formsRouter)
  .use("/status", statusRouter)
  // 404: Catches all unmatched routes
  .use(routeNotFoundMiddleware)
  // 500: Catches all unhandled errors from non async functions and errors passed through next() in async functions
  .use(globalErrorHandlerMiddleware);

export default router;
