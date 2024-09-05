import { describe, beforeAll } from "vitest";
// import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
// import { encryptFormSubmission } from "@lib/vault/encryptFormSubmission.js";
// import { getMockRes } from "vitest-mock-express";

// vi.mock("@lib/vault/getFormSubmission");
// vi.mock("@lib/vault/encryptFormSubmission");
// const getFormSubmissionMock = vi.mocked(getFormSubmission);
// const getEncryptedFormSubmissionMock = vi.mocked(encryptFormSubmission);

// const { res, next, mockClear } = getMockRes();

// This file will

describe("/forms/:formId/submission/:submissionName", () => {
  beforeAll(() => {
    // mockClear();
  });

  // describe.skip("Response to GET operation when", () => {
  //   it("form submission does not exist", () => {
  //     getFormSubmissionMock.mockResolvedValueOnce(undefined);
  //     const req = getMockReq({
  //       method: "GET",
  //       params: {
  //         formId: "formId",
  //         submissionName: "submissionName",
  //         serviceAccountId: "serviceAccountId",
  //       },
  //     });

  //     submissionNameApiRoute(req, res, next);

  //     expect(res.status).toHaveBeenCalledWith(404);
  //     expect(res.json).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         error: "Form submission does not exist",
  //       }),
  //     );
  //   });

  //   it("form submission does exist", async () => {
  //     getFormSubmissionMock.mockResolvedValueOnce(
  //       buildMockedFormSubmission(FormSubmissionStatus.New),
  //     );

  //     getEncryptedFormSubmissionMock.mockResolvedValueOnce({
  //       encryptedResponses: Buffer.from("encryptedResponses"),
  //       encryptedKey: "encryptedKey",
  //       encryptedNonce: "encryptedNonce",
  //       encryptedAuthTag: "encryptedAuthTag",
  //     });

  //     const response = await request(server).get("/");

  //     expect(response.status).toBe(200);
  //     expect(response.body).toEqual(
  //       expect.objectContaining({
  //         status: FormSubmissionStatus.New,
  //       }),
  //     );
  //   });

  //   it("processing fails due to internal error", async () => {
  //     getFormSubmissionMock.mockRejectedValueOnce(new Error("custom error"));
  //     const consoleErrorLogSpy = vi.spyOn(console, "error");

  //     const response = await request(server).get("/");

  //     expect(response.status).toBe(500);
  //     expect(consoleErrorLogSpy).toHaveBeenCalledWith(
  //       expect.stringContaining(
  //         "[route] Internal error while serving request: /forms/undefined/submission/undefined. Reason:",
  //       ),
  //     );
  //   });
  // });
});
