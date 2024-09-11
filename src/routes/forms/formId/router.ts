import { Router } from "express";
import { templateApiRoute } from "@routes/forms/formId/template/router.js";
import { submissionApiRoute } from "@routes/forms/formId/submission/router.js";

export const formIdApiRoute = Router({
  mergeParams: true,
});

formIdApiRoute.use("/template", templateApiRoute);
formIdApiRoute.use("/submission", submissionApiRoute);
