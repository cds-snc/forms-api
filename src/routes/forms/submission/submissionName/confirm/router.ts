import { Router } from "express";
import { confirmationCodeApiRoute } from "@src/routes/forms/submission/submissionName/confirm/confirmationCode/router";

export const confirmApiRoute = Router({
  mergeParams: true,
});

confirmApiRoute.use("/:confirmationCode", confirmationCodeApiRoute);
