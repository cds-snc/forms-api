import { vi, describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { submissionApiRoute } from "@routes/forms/submission/router";
import { getFormSubmission } from "@src/lib/vault/getFormSubmission";
import { getNewFormSubmissions } from "@src/lib/vault/getNewFormSubmissions";
import { FormSubmissionStatus } from "@src/lib/vault/dataStructures/formSubmission";
import {
  buildMockedFormSubmission,
  buildMockedNewFormSubmission,
} from "test/mocks/formSubmission";

vi.mock("@lib/vault/getFormSubmission");
const getFormSubmissionMock = vi.mocked(getFormSubmission);

vi.mock("@lib/vault/getNewFormSubmissions");
const getNewFormSubmissionsMock = vi.mocked(getNewFormSubmissions);

describe("/forms/:formId/submission", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", submissionApiRoute);
  });

  describe("/new", () => {
    it("Response to GET operation", async () => {
      getNewFormSubmissionsMock.mockResolvedValueOnce([
        buildMockedNewFormSubmission(),
      ]);

      const response = await request(server).get("/new");

      expect(response.status).toBe(200);
    });
  });

  describe("/:submissionName", () => {
    describe("Response to GET operation when", () => {
      it("submissionName format is valid", async () => {
        getFormSubmissionMock.mockResolvedValueOnce(
          buildMockedFormSubmission(FormSubmissionStatus.New),
        );

        const response = await request(server).get("/01-08-a571");

        expect(response.status).toBe(200);
      });

      it.each([
        "invalid",
        "010-08-a571",
        "01-08-a51",
        "0-8-a71",
        "ab-01-a571",
        "01-ab-a571",
      ])(
        "submissionName format is not valid (testing %s)",
        async (submissionName: string) => {
          const response = await request(server).get(`/${submissionName}`);
          expect(response.status).toBe(404);
        },
      );
    });
  });
});
