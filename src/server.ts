import express, { Express } from "express";
import { SERVER_PORT } from "./config";
import { router } from "./router";

const server: Express = express();

server.use("/", router);

server.listen(SERVER_PORT, () => {
  console.log("-----------------------------------------");
  console.log(`API server started on port ${SERVER_PORT}`);
  console.log("-----------------------------------------");
});
