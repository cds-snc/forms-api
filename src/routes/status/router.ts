import { type Response, Router } from "express";

export const statusApiRoute = Router();

statusApiRoute.get("/", (_, response: Response) => {
  response.json({
    status: "running",
  });
});
