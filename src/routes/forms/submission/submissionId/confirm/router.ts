import { Router } from "express";
import { confirmationCodeApiRoute } from "./confirmationCode/router";

export const confirmApiRoute = Router({
  mergeParams: true,
});

confirmApiRoute.use("/:confirmationCode", confirmationCodeApiRoute);
