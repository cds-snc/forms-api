import { Router } from "express";
import { newApiRoute } from "@routes/forms/submission/new/router.js";
import { submissionNameApiRoute } from "@src/routes/forms/submission/submissionName/router.js";

export const submissionApiRoute = Router({
  mergeParams: true,
});

submissionApiRoute
  .use("/new", newApiRoute)
  .use(
    "/:submissionName([0-9]{2}-[0-9]{2}-[a-z0-9]{4})",
    submissionNameApiRoute,
  );
