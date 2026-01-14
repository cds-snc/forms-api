import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { retrieveNewSubmissionsOperationV1 } from "@operations/retrieveNewSubmissions.v1.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";

vi.mock("@lib/vault/getNewFormSubmissions");
const getNewFormSubmissionsMock = vi.mocked(getNewFormSubmissions);

const auditLogSpy = vi.spyOn(auditLogsModule, "auditLog");

describe("retrieveNewSubmissionsOperation handler should", () => {
  const requestMock = getMockReq({
    params: {
      formId: "clzsn6tao000611j50dexeob0",
    },
    serviceUserId: "clzsn6tao000611j50dexeob0",
    clientIp: "1.1.1.1",
  });

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();
  });

  it("respond with success when no new form submission has been found", async () => {
    getNewFormSubmissionsMock.mockResolvedValueOnce([]);

    await retrieveNewSubmissionsOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith([]);
    expect(auditLogSpy).toHaveBeenNthCalledWith(1, {
      userId: "clzsn6tao000611j50dexeob0",
      subject: { type: "Form", id: "clzsn6tao000611j50dexeob0" },
      event: "RetrieveNewResponses",
      clientIp: "1.1.1.1",
    });
  });

  it("respond with success when new form submission have been found", async () => {
    getNewFormSubmissionsMock.mockResolvedValueOnce([
      {
        name: "ABC",
        createdAt: 123,
      },
    ]);

    await retrieveNewSubmissionsOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith([
      {
        createdAt: 123,
        name: "ABC",
      },
    ]);
    expect(auditLogSpy).toHaveBeenNthCalledWith(1, {
      userId: "clzsn6tao000611j50dexeob0",
      subject: { type: "Form", id: "clzsn6tao000611j50dexeob0" },
      event: "RetrieveNewResponses",
      clientIp: "1.1.1.1",
    });
  });

  it("pass error to next function when processing fails due to internal error", async () => {
    getNewFormSubmissionsMock.mockRejectedValueOnce(new Error("custom error"));

    await retrieveNewSubmissionsOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(
      new Error(
        "[operation] Internal error while retrieving new submissions. Params: formId = clzsn6tao000611j50dexeob0",
      ),
    );
  });
});
