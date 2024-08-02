import request from "supertest";
import { initialize } from "express-openapi";
import { describe, expect, it, vi } from "vitest";
import app from "../app";

vi.mock("express-openapi");

describe("OpenAPI init", () => {
  it("should initialize the API", () => {
    expect(initialize).toHaveBeenCalledWith({
      app: app,
      docsPath: "/docs",
      exposeApiDocs: true,
      apiDoc: "./api/v1/api-definition-base.yml",
      paths: "./api/v1/routes",
    });
  });
});

describe("GET /status", () => {
  it("should return a status message", async () => {
    const response = await request(app).get("/status");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ Status: "Running" });
  });
});
