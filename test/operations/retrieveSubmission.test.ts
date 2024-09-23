import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptFormSubmission } from "@lib/encryption/encryptFormSubmission.js";
import { retrieveSubmissionOperation } from "@operations/retrieveSubmission.js";
import { logMessage } from "@lib/logging/logger.js";
import { FormSubmissionStatus } from "@lib/vault/types/formSubmission.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";

vi.mock("@lib/vault/getFormSubmission");
const getFormSubmissionMock = vi.mocked(getFormSubmission);

vi.mock("@lib/encryption/encryptFormSubmission");
const encryptFormSubmissionMock = vi.mocked(encryptFormSubmission);

const publishAuditLogSpy = vi.spyOn(auditLogsModule, "publishAuditLog");

describe("retrieveSubmissionOperation handler should", () => {
  const requestMock = getMockReq({
    params: {
      formId: "clzsn6tao000611j50dexeob0",
      submissionName: "01-08-a571",
    },
    serviceUserId: "clzsn6tao000611j50dexeob0",
    serviceAccountId: "235435656365365363",
  });

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();
  });

  it("respond with success when form submission does exist", async () => {
    getFormSubmissionMock.mockResolvedValueOnce({
      createdAt: 0,
      status: FormSubmissionStatus.New,
      confirmationCode: "",
      answers: "",
      checksum: "",
    });

    encryptFormSubmissionMock.mockResolvedValueOnce({
      encryptedResponses: "encryptedResponses",
      encryptedKey: "encryptedKey",
      encryptedNonce: "encryptedNonce",
      encryptedAuthTag: "encryptedAuthTag",
    });

    await retrieveSubmissionOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith({
      encryptedAuthTag: "encryptedAuthTag",
      encryptedKey: "encryptedKey",
      encryptedNonce: "encryptedNonce",
      encryptedResponses: "encryptedResponses",
    });
    expect(publishAuditLogSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeob0",
      {
        id: "01-08-a571",
        type: "Response",
      },
      "DownloadResponse",
    );
  });

  it("respond with error when form submission does not exist", async () => {
    getFormSubmissionMock.mockResolvedValueOnce(undefined);

    await retrieveSubmissionOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.status).toHaveBeenCalledWith(404);
    expect(responseMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Form submission does not exist",
      }),
    );
  });

  it("respond with error when processing fails due to internal error", async () => {
    getFormSubmissionMock.mockRejectedValueOnce(new Error("custom error"));
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await retrieveSubmissionOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
    expect(logMessageSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[operation] Internal error while retrieving submission. Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571. Reason:",
      ),
    );
  });
});
