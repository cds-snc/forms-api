import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { retrieveNewSubmissionsOperation } from "@operations/retrieveNewSubmissions.js";
import { logMessage } from "@lib/logging/logger.js";
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
  });

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();
  });

  it("respond with success when no new form submission has been found", async () => {
    getNewFormSubmissionsMock.mockResolvedValueOnce([]);

    await retrieveNewSubmissionsOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith([]);
    expect(auditLogSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeob0",
      {
        id: "clzsn6tao000611j50dexeob0",
        type: "Form",
      },
      "RetrieveNewResponses",
    );
  });

  it("respond with success when new form submission have been found", async () => {
    getNewFormSubmissionsMock.mockResolvedValueOnce([
      {
        name: "ABC",
        createdAt: 123,
      },
    ]);

    await retrieveNewSubmissionsOperation.handler(
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
    expect(auditLogSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeob0",
      {
        id: "clzsn6tao000611j50dexeob0",
        type: "Form",
      },
      "RetrieveNewResponses",
    );
  });

  it("respond with error when processing fails due to internal error", async () => {
    const customError = new Error("custom error");
    getNewFormSubmissionsMock.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await retrieveNewSubmissionsOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[operation] Internal error while retrieving new submissions. Params: formId = clzsn6tao000611j50dexeob0",
      ),
    );
  });
});
