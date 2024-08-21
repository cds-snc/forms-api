import { Router } from "express";
import { newApiRoute } from "@routes/forms/submission/new/router";
import { downloadedApiRoute } from "@routes/forms/submission/downloaded/router";
import { submissionNameApiRoute } from "@src/routes/forms/submission/submissionName/router";

export const submissionApiRoute = Router({
  mergeParams: true,
});

submissionApiRoute
  .use("/new", newApiRoute)
  .use("/downloaded", downloadedApiRoute)
  .use(
    "/:submissionName([0-9]{2}-[0-9]{2}-[a-z0-9]{4})",
    submissionNameApiRoute,
  );
