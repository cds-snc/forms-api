import { Router } from "express";

export const route = Router();

route.get("/", (_, response) => {
  response.send({
    Status: "Running",
  });
});
