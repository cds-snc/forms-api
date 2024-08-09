import { Router } from "express";
import newRouter from "./new/router";
import downloadedRouter from "./downloaded/router";
import submissionIdRouter from "./submissionId/router";

const router = Router({
  mergeParams: true,
});

router
  .use("/new", newRouter)
  .use("/downloaded", downloadedRouter)
  .use("/:submissionId", submissionIdRouter);

export default router;
