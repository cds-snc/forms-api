import { vi, describe, beforeAll, it, expect } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { confirmFormSubmission } from "@src/lib/vault/confirmFormSubmission";
import { confirmApiRoute } from "@src/routes/forms/submission/submissionName/confirm/router";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionNotFoundException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@src/lib/vault/dataStructures/exceptions";

vi.mock("@lib/vault/confirmFormSubmission");
const confirmFormSubmissionMock = vi.mocked(confirmFormSubmission);

describe("/forms/:formId/submission/:submissionName/confirm/:confirmationCode", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", confirmApiRoute);
  });

  describe("Response to PUT operation when", () => {
    it("confirmation is successful", async () => {
      confirmFormSubmissionMock.mockResolvedValueOnce();

      const response = await request(server).put(
        "/620b203c-9836-4000-bf30-1c3bcc26b834",
      );

      expect(response.status).toBe(200);
    });

    it("form submission does not exist", async () => {
      confirmFormSubmissionMock.mockRejectedValueOnce(
        new FormSubmissionNotFoundException(),
      );

      const response = await request(server).put(
        "/620b203c-9836-4000-bf30-1c3bcc26b834",
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Form submission does not exist",
      });
    });

    it("form submission is already confirmed", async () => {
      confirmFormSubmissionMock.mockRejectedValueOnce(
        new FormSubmissionAlreadyConfirmedException(),
      );

      const response = await request(server).put(
        "/620b203c-9836-4000-bf30-1c3bcc26b834",
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        info: "Form submission is already confirmed",
      });
    });

    it("confirmation code is incorrect", async () => {
      confirmFormSubmissionMock.mockRejectedValueOnce(
        new FormSubmissionIncorrectConfirmationCodeException(),
      );

      const response = await request(server).put(
        "/620b203c-9836-4000-bf30-1c3bcc26b834",
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Confirmation code is incorrect",
      });
    });
  });
});
