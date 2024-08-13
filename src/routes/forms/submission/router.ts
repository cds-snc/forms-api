import { Router } from "express";
import { newApiRoute } from "./new/router";
import { downloadedApiRoute } from "./downloaded/router";
import { submissionIdApiRoute } from "./submissionId/router";

export const submissionApiRoute = Router({
  mergeParams: true,
});

submissionApiRoute
  .use("/new", newApiRoute)
  .use("/downloaded", downloadedApiRoute)
  .use("/:submissionId", submissionIdApiRoute);
