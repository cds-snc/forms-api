import { vi, describe, it, expect, beforeEach } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { retrieveTemplateOperation } from "@operations/retrieveTemplate.js";
import { logMessage } from "@lib/logging/logger.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";

vi.mock("@lib/formsClient/getFormTemplate");
const getFormTemplateMock = vi.mocked(getFormTemplate);

const publishAuditLogSpy = vi.spyOn(auditLogsModule, "publishAuditLog");

describe("retrieveTemplateOperation handler should", () => {
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

  it("respond with success when form submission does exist", async () => {
    getFormTemplateMock.mockResolvedValueOnce({
      jsonConfig: {
        elements: [
          {
            id: 1,
            type: "textField",
          },
        ],
      },
    });

    await retrieveTemplateOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.json).toHaveBeenCalledWith({
      elements: [
        {
          id: 1,
          type: "textField",
        },
      ],
    });
    expect(publishAuditLogSpy).toHaveBeenNthCalledWith(
      1,
      "clzsn6tao000611j50dexeob0",
      {
        id: "clzsn6tao000611j50dexeob0",
        type: "Form",
      },
      "RetrieveTemplate",
    );
  });

  it("respond with error when form template does not exist", async () => {
    getFormTemplateMock.mockResolvedValueOnce(undefined);

    await retrieveTemplateOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.status).toHaveBeenCalledWith(404);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Form template does not exist",
    });
  });

  it("respond with error when processing fails due to internal error", async () => {
    getFormTemplateMock.mockRejectedValueOnce(new Error("custom error"));
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await retrieveTemplateOperation.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
    expect(logMessageSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[operation] Internal error while retrieving template. Params: formId = clzsn6tao000611j50dexeob0. Reason:",
      ),
    );
  });
});
