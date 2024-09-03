import { vi, describe, beforeAll, it, expect } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { reportProblemWithFormSubmission } from "@src/lib/vault/reportProblemWithFormSubmission";
import { problemApiRoute } from "@src/routes/forms/submission/submissionName/problem/router";
import { FormSubmissionNotFoundException } from "@src/lib/vault/dataStructures/exceptions";
import { notifySupportAboutFormSubmissionProblem } from "@src/lib/support/notifySupportAboutFormSubmissionProblem";

vi.mock("@lib/vault/reportProblemWithFormSubmission");
const reportProblemWithFormSubmissionMock = vi.mocked(
  reportProblemWithFormSubmission,
);

vi.mock("@src/lib/support/notifySupportAboutFormSubmissionProblem");
const notifySupportAboutFormSubmissionProblemMock = vi.mocked(
  notifySupportAboutFormSubmissionProblem,
);

function buildReportProblemOperationPayload(
  contactEmail?: string,
  description?: string,
  preferredLanguage?: string,
): Record<string, unknown> {
  return {
    contactEmail: contactEmail ?? "test@test.com",
    description: description ?? "This is the problem",
    preferredLanguage: preferredLanguage ?? "en",
  };
}

describe("/forms/:formId/submission/:submissionName/problem", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", problemApiRoute);
  });

  describe("Response to POST operation when", () => {
    it("report problem and notify support operations are both successful", async () => {
      reportProblemWithFormSubmissionMock.mockResolvedValueOnce();
      notifySupportAboutFormSubmissionProblemMock.mockResolvedValueOnce();

      const response = await request(server)
        .post("/")
        .send(buildReportProblemOperationPayload());

      expect(response.status).toBe(200);
    });

    it.each([
      ["clement.janin@cds-snc", "here is my problem", "en"],
      ["clement.janin@cds-snc.ca", "yes", "en"],
      ["clement.janin@cds-snc.ca", "here is my problem", "ok"],
    ])(
      "payload is invalid (testing contactEmail: %s / description: %s / preferredLanguage: %s)",
      async (
        contactEmail: string,
        description: string,
        preferredLanguage: string,
      ) => {
        const response = await request(server)
          .post("/")
          .send(
            buildReportProblemOperationPayload(
              contactEmail,
              description,
              preferredLanguage,
            ),
          );

        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            error: "Invalid payload",
          }),
        );
      },
    );

    it("form submission does not exist", async () => {
      reportProblemWithFormSubmissionMock.mockRejectedValueOnce(
        new FormSubmissionNotFoundException(),
      );

      const response = await request(server)
        .post("/")
        .send(buildReportProblemOperationPayload());

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Form submission does not exist",
      });
    });

    it("processing fails due to internal error caused by the reportProblemWithFormSubmission function", async () => {
      reportProblemWithFormSubmissionMock.mockImplementationOnce(() => {
        throw new Error("custom error");
      });
      const consoleErrorLogSpy = vi.spyOn(console, "error");

      const response = await request(server)
        .post("/")
        .send(buildReportProblemOperationPayload());

      expect(response.status).toBe(500);
      expect(consoleErrorLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[route] Internal error while serving request: /forms/undefined/submission/undefined/problem. Reason:",
        ),
      );
    });

    it("processing fails due to internal error caused by the notifySupportAboutFormSubmissionProblem function", async () => {
      notifySupportAboutFormSubmissionProblemMock.mockImplementationOnce(() => {
        throw new Error("custom error");
      });
      const consoleErrorLogSpy = vi.spyOn(console, "error");

      const response = await request(server)
        .post("/")
        .send(buildReportProblemOperationPayload());

      expect(response.status).toBe(500);
      expect(consoleErrorLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[route] Internal error while serving request: /forms/undefined/submission/undefined/problem. Reason:",
        ),
      );
    });
  });
});