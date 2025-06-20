import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { confirmFormSubmission } from "@lib/vault/confirmFormSubmission.js";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionNotFoundException,
  FormSubmissionIncorrectConfirmationCodeException,
} from "@lib/vault/types/exceptions.types.js";
import { confirmSubmissionOperationV1 } from "@operations/confirmSubmission.v1.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";

vi.mock("@lib/vault/confirmFormSubmission");
const confirmFormSubmissionMock = vi.mocked(confirmFormSubmission);

const auditLogSpy = vi.spyOn(auditLogsModule, "auditLog");

describe("confirmSubmissionOperation handler should", () => {
  const requestMock = getMockReq({
    params: {
      formId: "clzsn6tao000611j50dexeob0",
      submissionName: "01-08-a571",
      confirmationCode: "620b203c-9836-4000-bf30-1c3bcc26b834",
    },
    serviceUserId: "clzsn6tao000611j50dexeob0",
  });

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();
  });

  it("respond with success when confirmation successfully completes", async () => {
    confirmFormSubmissionMock.mockResolvedValueOnce();

    await confirmSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.sendStatus).toHaveBeenCalledWith(200);
    expect(auditLogSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeob0",
      {
        id: "01-08-a571",
        type: "Response",
      },
      "ConfirmResponse",
    );
  });

  it("respond with error when form submission does not exist", async () => {
    confirmFormSubmissionMock.mockRejectedValueOnce(
      new FormSubmissionNotFoundException(),
    );

    await confirmSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.status).toHaveBeenCalledWith(404);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Form submission does not exist",
    });
  });

  it("respond with success when form submission is already confirmed", async () => {
    confirmFormSubmissionMock.mockRejectedValueOnce(
      new FormSubmissionAlreadyConfirmedException(),
    );

    await confirmSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(responseMock.json).toHaveBeenCalledWith({
      info: "Form submission is already confirmed",
    });
  });

  it("respond with error when confirmation code is incorrect", async () => {
    confirmFormSubmissionMock.mockRejectedValueOnce(
      new FormSubmissionIncorrectConfirmationCodeException(),
    );

    await confirmSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.status).toHaveBeenCalledWith(400);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Confirmation code is incorrect",
    });
  });

  it("pass error to next function when processing fails due to internal error", async () => {
    confirmFormSubmissionMock.mockRejectedValueOnce(new Error("custom error"));

    await confirmSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(
      new Error(
        "[operation] Internal error while confirming submission. Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571 ; confirmationCode = 620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    );
  });
});
