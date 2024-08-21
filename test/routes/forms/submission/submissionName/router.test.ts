import { vi, describe, beforeAll, it, expect } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { submissionNameApiRoute } from "@routes/forms/submission/submissionName/router";
import { getFormSubmission } from "@lib/vault/getFormSubmission";
import { FormSubmissionStatus } from "@src/lib/vault/dataStructures/formSubmission";

vi.mock("@lib/vault/getFormSubmission");
const getFormSubmissionMock = vi.mocked(getFormSubmission);

describe("/forms/:formId/submission/:submissionName", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", submissionNameApiRoute);
  });

  describe("Response to GET operation when", () => {
    it("form submission does not exist", async () => {
      getFormSubmissionMock.mockResolvedValueOnce(undefined);

      const response = await request(server).get("/");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Requested form submission does not exist",
      });
    });

    it("form submission does exist", async () => {
      getFormSubmissionMock.mockResolvedValueOnce({
        status: FormSubmissionStatus.New,
        answers: "Here is my form submission",
      });

      const response = await request(server).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: FormSubmissionStatus.New,
        answers: "Here is my form submission",
      });
    });

    it("processing fails due to internal error", async () => {
      getFormSubmissionMock.mockImplementationOnce(() => {
        throw new Error("custom error");
      });
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
