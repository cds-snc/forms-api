import { vi, describe, beforeAll, it, expect } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { newApiRoute } from "@routes/forms/formId/submission/new/router.js";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { logMessage } from "@src/lib/logger.js";

vi.mock("@lib/vault/getNewFormSubmissions");
const getNewFormSubmissionsMock = vi.mocked(getNewFormSubmissions);

describe("/forms/:formId/submission/new", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", newApiRoute);
  });

  describe("Response to GET operation when", () => {
    it("no new form submission has been found", async () => {
      getNewFormSubmissionsMock.mockResolvedValueOnce([]);

      const response = await request(server).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("some new form submission have been found", async () => {
      getNewFormSubmissionsMock.mockResolvedValueOnce([
        {
          name: "ABC",
          createdAt: 123,
        },
      ]);

      const response = await request(server).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          createdAt: 123,
          name: "ABC",
        },
      ]);
    });

    it("processing fails due to internal error", async () => {
      getNewFormSubmissionsMock.mockRejectedValueOnce(
        new Error("custom error"),
      );
      const logMessageSpy = vi.spyOn(logMessage, "error");

      const response = await request(server).get("/");

      expect(response.status).toBe(500);
      expect(logMessageSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[route] Internal error while serving request: /forms/undefined/submission/new. Reason:",
        ),
      );
    });
  });
});
