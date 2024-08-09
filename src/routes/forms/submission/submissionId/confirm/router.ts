import { Router } from "express";
import confirmationCodeRouter from "./confirmationCode/router";

const router = Router({
  mergeParams: true,
});

router.use("/:confirmationCode", confirmationCodeRouter);

export default router;
