import request from "supertest";
import { describe, expect, it } from "vitest";
import express, { Express } from "express";
import statusRouter from "../../src/routes/status/router";

const server: Express = express();
server.use("/", statusRouter);

describe("GET /", () => {
  it("should return a status message", async () => {
    const response = await request(server).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "running" });
  });
});
