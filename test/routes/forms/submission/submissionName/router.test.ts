import { vi, describe, beforeAll, it, expect } from "vitest";
import request from "supertest";
import express, { Router, type Express, type Response } from "express";
import { submissionNameApiRoute } from "@routes/forms/submission/submissionName/router";
import { getFormSubmission } from "@lib/vault/getFormSubmission";
import { FormSubmissionStatus } from "@src/lib/vault/dataStructures/formSubmission";

vi.mock("@lib/vault/getFormSubmission");
const getFormSubmissionMock = vi.mocked(getFormSubmission);

vi.mock("@routes/forms/submission/submissionName/confirm/router", () => ({
  confirmApiRoute: Router().put("/", (_, response: Response) => {
    return response.sendStatus(200);
  }),
}));

vi.mock("@routes/forms/submission/submissionName/problem/router", () => ({
  problemApiRoute: Router().post("/", (_, response: Response) => {
    return response.sendStatus(200);
  }),
}));

describe("/forms/:formId/submission/:submissionName", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", submissionNameApiRoute);
  });

  describe("/confirm", () => {
    it("Response to GET operation", async () => {
      const response = await request(server).put("/confirm");
      expect(response.status).toBe(200);
    });
  });

  describe("/problem", () => {
    it("Response to GET operation", async () => {
      const response = await request(server).post("/problem");
      expect(response.status).toBe(200);
    });
  });

  describe("Response to GET operation when", () => {
    it("form submission does not exist", async () => {
      getFormSubmissionMock.mockResolvedValueOnce(undefined);

      const response = await request(server).get("/");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Form submission does not exist",
      });
    });

    it("form submission does exist", async () => {
      getFormSubmissionMock.mockResolvedValueOnce({
        status: FormSubmissionStatus.New,
        confirmationCode: "58386068-6ce8-4e4f-89b2-e329df9c8b42",
        answers: "Here is my form submission",
      });

      const response = await request(server).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          status: FormSubmissionStatus.New,
        }),
      );
    });

    it("processing fails due to internal error", async () => {
      getFormSubmissionMock.mockRejectedValueOnce(new Error("custom error"));
      const consoleErrorLogSpy = vi.spyOn(console, "error");

      const response = await request(server).get("/");

      expect(response.status).toBe(500);
      expect(consoleErrorLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[route] Internal error while serving request: /forms/undefined/submission/undefined. Reason:",
        ),
      );
    });
  });
});
