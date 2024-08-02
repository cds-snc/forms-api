import express from "express";
import { initialize } from "express-openapi";

const app = new express();

initialize({
  app,
  docsPath: "/docs",
  exposeApiDocs: true,
  apiDoc: "./api/v1/api-definition-base.yml",
  paths: "./api/v1/routes",
});

app.get("/status", (request, response) => {
  const status = {
    Status: "Running",
  };
  response.send(status);
});

export default app;
