import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { encryptResponse } from "@lib/encryption/encryptResponse.js";
import { retrieveSubmissionOperationV1 } from "@operations/retrieveSubmission.v1.js";
import {
  AttachmentScanStatus,
  SubmissionStatus,
} from "@lib/vault/types/formSubmission.types.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";
import { FormSubmissionNotFoundException } from "@lib/vault/types/exceptions.types.js";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import { getFormSubmissionAttachmentDownloadLink } from "@lib/vault/getFormSubmissionAttachmentDownloadLink.js";

vi.mock("@lib/formsClient/getPublicKey");
const getPublicKeyMock = vi.mocked(getPublicKey);

vi.mock("@lib/vault/getFormSubmission");
const getFormSubmissionMock = vi.mocked(getFormSubmission);

vi.mock("@lib/vault/getFormSubmissionAttachmentDownloadLink");
const getFormSubmissionAttachmentDownloadLinkMock = vi.mocked(
  getFormSubmissionAttachmentDownloadLink,
);

vi.mock("@lib/encryption/encryptResponse");
const encryptResponseMock = vi.mocked(encryptResponse);

const auditLogSpy = vi.spyOn(auditLogsModule, "auditLog");

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

  it("respond with success when form submission with no attachments does exist", async () => {
    getFormSubmissionMock.mockResolvedValueOnce({
      createdAt: 0,
      status: SubmissionStatus.New,
      confirmationCode: "",
      answers: "",
      checksum: "",
      attachments: [],
    });
    getPublicKeyMock.mockResolvedValueOnce("publicKey");
    encryptResponseMock.mockReturnValueOnce({
      encryptedKey: "encryptedKey",
      encryptedNonce: "encryptedNonce",
      encryptedAuthTag: "encryptedAuthTag",
      encryptedResponses: "encryptedResponses",
    });

    await retrieveSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith({
      encryptedKey: "encryptedKey",
      encryptedNonce: "encryptedNonce",
      encryptedAuthTag: "encryptedAuthTag",
      encryptedResponses: "encryptedResponses",
    });

    expect(getFormSubmissionAttachmentDownloadLinkMock).not.toHaveBeenCalled();
    expect(encryptResponseMock).toHaveBeenCalledWith(
      "publicKey",
      JSON.stringify({
        createdAt: 0,
        status: "New",
        confirmationCode: "",
        answers: "",
        checksum: "",
      }),
    );

    expect(auditLogSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeob0",
      {
        id: "01-08-a571",
        type: "Response",
      },
      "DownloadResponse",
    );
  });

  it("respond with success when form submission with attachments does exist", async () => {
    getFormSubmissionMock.mockResolvedValueOnce({
      createdAt: 0,
      status: SubmissionStatus.New,
      confirmationCode: "",
      answers:
        '{"1":"Test1","2":"form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt}',
      checksum: "",
      attachments: [
        {
          id: "testId",
          name: "output.txt",
          path: "form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt",
          scanStatus: AttachmentScanStatus.NoThreatsFound,
        },
      ],
    });
    getFormSubmissionAttachmentDownloadLinkMock.mockResolvedValueOnce(
      "https://download-link",
    );
    getPublicKeyMock.mockResolvedValueOnce("publicKey");
    encryptResponseMock.mockReturnValueOnce({
      encryptedKey: "encryptedKey",
      encryptedNonce: "encryptedNonce",
      encryptedAuthTag: "encryptedAuthTag",
      encryptedResponses: "encryptedResponses",
    });

    await retrieveSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith({
      encryptedKey: "encryptedKey",
      encryptedNonce: "encryptedNonce",
      encryptedAuthTag: "encryptedAuthTag",
      encryptedResponses: "encryptedResponses",
    });

    expect(getFormSubmissionAttachmentDownloadLinkMock).toHaveBeenCalled();
    expect(encryptResponseMock).toHaveBeenCalledWith(
      "publicKey",
      JSON.stringify({
        createdAt: 0,
        status: "New",
        confirmationCode: "",
        answers:
          '{"1":"Test1","2":"form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt}',
        checksum: "",
        attachments: [
          {
            name: "output.txt",
            downloadLink: "https://download-link",
            isPotentiallyMalicious: false,
          },
        ],
      }),
    );

    expect(auditLogSpy).toHaveBeenNthCalledWith(
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
    getFormSubmissionMock.mockRejectedValueOnce(
      new FormSubmissionNotFoundException(),
    );

    await retrieveSubmissionOperationV1.handler(
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

  it.each([
    {
      attachmentScanStatus: AttachmentScanStatus.NoThreatsFound,
      isPotentiallyMalicious: false,
    },
    {
      attachmentScanStatus: AttachmentScanStatus.ThreatsFound,
      isPotentiallyMalicious: true,
    },
    {
      attachmentScanStatus: AttachmentScanStatus.Unsupported,
      isPotentiallyMalicious: true,
    },
    {
      attachmentScanStatus: AttachmentScanStatus.Failed,
      isPotentiallyMalicious: true,
    },
  ])(
    "properly detect attachment maliciousness depending on scan status (attachmentScanStatus: %s / isPotentiallyMalicious: %s)",
    async ({ attachmentScanStatus, isPotentiallyMalicious }) => {
      getFormSubmissionMock.mockResolvedValueOnce({
        createdAt: 0,
        status: SubmissionStatus.New,
        confirmationCode: "",
        answers:
          '{"1":"Test1","2":"form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt}',
        checksum: "",
        attachments: [
          {
            id: "testId",
            name: "output.txt",
            path: "form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt",
            scanStatus: attachmentScanStatus,
          },
        ],
      });
      getFormSubmissionAttachmentDownloadLinkMock.mockResolvedValueOnce(
        "https://download-link",
      );
      getPublicKeyMock.mockResolvedValueOnce("publicKey");

      await retrieveSubmissionOperationV1.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(encryptResponseMock).toHaveBeenCalledWith(
        "publicKey",
        JSON.stringify({
          createdAt: 0,
          status: "New",
          confirmationCode: "",
          answers:
            '{"1":"Test1","2":"form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt}',
          checksum: "",
          attachments: [
            {
              name: "output.txt",
              downloadLink: "https://download-link",
              isPotentiallyMalicious,
            },
          ],
        }),
      );
    },
  );

  it("pass error to next function when processing fails due to internal error when retrieving submission attachment content", async () => {
    getFormSubmissionMock.mockResolvedValueOnce({
      createdAt: 0,
      status: SubmissionStatus.New,
      confirmationCode: "",
      answers:
        '{"1":"Test1","2":"form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt}',
      checksum: "",
      attachments: [
        {
          id: "testId",
          name: "output.txt",
          path: "form_attachments/2025-06-09/8b42aafd-09e9-44ad-9208-d3891a7858df/output.txt",
          scanStatus: AttachmentScanStatus.NoThreatsFound,
        },
      ],
    });
    getFormSubmissionAttachmentDownloadLinkMock.mockRejectedValueOnce(
      new Error("custom error"),
    );

    await retrieveSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(
      new Error(
        "[operation] Internal error while retrieving submission. Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571",
      ),
    );
  });

  it("pass error to next function when processing fails due to internal error when retrieving public key", async () => {
    getFormSubmissionMock.mockResolvedValueOnce({
      createdAt: 0,
      status: SubmissionStatus.New,
      confirmationCode: "",
      answers: "",
      checksum: "",
      attachments: [],
    });
    getPublicKeyMock.mockImplementationOnce(() => {
      throw new Error("custom error");
    });

    await retrieveSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(
      new Error(
        "[operation] Internal error while retrieving submission. Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571",
      ),
    );
  });

  it("pass error to next function when processing fails due to internal error", async () => {
    getFormSubmissionMock.mockRejectedValueOnce(new Error("custom error"));

    await retrieveSubmissionOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(
      new Error(
        "[operation] Internal error while retrieving submission. Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571",
      ),
    );
  });
});
