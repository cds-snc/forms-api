import { vi, describe, beforeAll, it, expect } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { submissionNameApiRoute } from "@routes/forms/submission/submissionName/router.js";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptFormSubmission } from "@lib/vault/encryptFormSubmission.js";
import { FormSubmissionStatus } from "@lib/vault/dataStructures/formSubmission.js";
import { buildMockedFormSubmission } from "test/mocks/formSubmission.js";
import { getMockReq, getMockRes } from "vitest-mock-express";

vi.mock("@lib/vault/getFormSubmission");
vi.mock("@lib/vault/encryptFormSubmission");
const getFormSubmissionMock = vi.mocked(getFormSubmission);
const getEncryptedFormSubmissionMock = vi.mocked(encryptFormSubmission);

describe("/forms/:formId/submission/:submissionName", () => {
  let server: Express;
  const { res, next, mockClear } = getMockRes();

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
        error: "Form submission does not exist",
      });
    });

    it("form submission does exist", async () => {
      getFormSubmissionMock.mockResolvedValueOnce(
        buildMockedFormSubmission(FormSubmissionStatus.New),
      );

      getEncryptedFormSubmissionMock.mockResolvedValueOnce({
        encryptedResponses: Buffer.from("encryptedResponses"),
        encryptedKey: "encryptedKey",
        encryptedNonce: "encryptedNonce",
        encryptedAuthTag: "encryptedAuthTag",
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
