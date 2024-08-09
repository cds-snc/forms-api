import { Response, Router } from "express";

const router = Router();

router.get("/", (_, response: Response) => {
  response.json({
    status: "running",
  });
});

export default router;
