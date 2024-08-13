import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { statusApiRoute } from "@routes/status/router";

describe("/status", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", statusApiRoute);
  });

  it("Response to GET operation", async () => {
    const response = await request(server).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "running" });
  });
});
