import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import router from "../../../src/routes/status/router";

describe("routes/status", () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use("/", router);
  });

  it("GET /status", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "running" });
  });
});
