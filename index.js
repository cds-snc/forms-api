import express from "express";
import { initialize } from "express-openapi";

const app = new express();
const port = process.env.PORT || 3001;

initialize({
  app,
  docsPath: "/api-definition",
  exposeApiDocs: true,
  apiDoc: "./api/v1/api-definition-base.yml",
  paths: "./api/v1/routes",
});

app.listen(port, () => {
  console.log("Server Listening on port:", port);
});

app.get("/status", (request, response) => {
  const status = {
    Status: "Running",
  };

  response.send(status);
});
