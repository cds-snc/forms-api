import { vi, describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import router from "../../../../src/routes/forms/router";

vi.mock("../../../../src/middleware/authentication/middleware", () => ({
  default: (_req, _res, next) => next(),
}));

vi.mock("../../../../src/middleware/rateLimiter/middleware", () => ({
  default: (_req, _res, next) => next(),
}));

describe("routes/forms/submission", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use("/", router);
  });

  it("GET /new", async () => {
    const response = await request(app).get("/1234/submission/new");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ formId: "1234" });
  });

  it("GET /downloaded", async () => {
    const response = await request(app).get("/1234/submission/downloaded");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ formId: "1234" });
  });

  it("GET /:submissionId", async () => {
    const response = await request(app).get("/1234/submission/5678");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      formId: "1234",
      submissionId: "5678",
    });
  });
});
