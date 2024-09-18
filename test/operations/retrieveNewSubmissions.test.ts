import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { retrieveNewSubmissionsOperation } from "@src/operations/retrieveNewSubmissions.js";
import { logMessage } from "@lib/logging/logger.js";

vi.mock("@lib/vault/getNewFormSubmissions");
const getNewFormSubmissionsMock = vi.mocked(getNewFormSubmissions);

describe("retrieveNewSubmissionsOperation handler should", () => {
  const requestMock = getMockReq({
    params: {
      formId: "clzsn6tao000611j50dexeob0",
    },
    serviceUserId: "clzsn6tao000611j50dexeob0",
  });

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
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
  });

  it("respond with error when processing fails due to internal error", async () => {
    getNewFormSubmissionsMock.mockRejectedValueOnce(new Error("custom error"));
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await retrieveNewSubmissionsOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
    expect(logMessageSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[operation] Internal error while retrieving new submissions. Params: formId = clzsn6tao000611j50dexeob0. Reason:",
      ),
    );
  });
});
