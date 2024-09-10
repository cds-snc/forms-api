import { vi, describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { type Express, type Response, Router } from "express";
import { formIdApiRoute } from "@routes/forms/formId/router.js";

vi.mock("@routes/forms/formId/template/router", () => ({
  templateApiRoute: Router().get("/", (_, response: Response) => {
    return response.sendStatus(200);
  }),
}));

vi.mock("@routes/forms/formId/submission/router", () => ({
  submissionApiRoute: Router().get("/", (_, response: Response) => {
    return response.sendStatus(200);
  }),
}));

describe("/forms/:formId", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", formIdApiRoute);
  });

  describe("/template", () => {
    it("Response to GET operation", async () => {
      const response = await request(server).get("/template");
      expect(response.status).toBe(200);
    });
  });

  describe("/submission", () => {
    it("Response to GET operation", async () => {
      const response = await request(server).get("/submission");
      expect(response.status).toBe(200);
    });
  });
});
