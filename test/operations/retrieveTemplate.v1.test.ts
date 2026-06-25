import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";
import { retrieveRequestContextData } from "@lib/storage/requestContextualStore.js";
import { retrieveTemplateOperationV1 } from "@operations/retrieveTemplate.v1.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";

vi.mock("@lib/formsClient/getFormTemplate");
const getFormTemplateMock = vi.mocked(getFormTemplate);

const auditLogSpy = vi.spyOn(auditLogsModule, "auditLog");

vi.mock("@lib/storage/requestContextualStore");
vi.mocked(retrieveRequestContextData).mockReturnValue(
  "clzsn6tao000611j50dexeob0",
);

describe("retrieveTemplateOperation handler should", () => {
  let requestMock = getMockReq();

  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();

    requestMock = getMockReq({
      params: {
        formId: "clzsn6tao000611j50dexeob0",
      },
      serviceUserId: "clzsn6tao000611j50dexeob0",
    });
  });

  it("respond with success when form template does exist", async () => {
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

    await retrieveTemplateOperationV1.handler(
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
    expect(auditLogSpy).toHaveBeenNthCalledWith(1, {
      userId: "clzsn6tao000611j50dexeob0",
      subject: { type: "Form", id: "clzsn6tao000611j50dexeob0" },
      event: "RetrieveTemplate",
    });
  });

  it("respond with success when specific version of a form template does exist", async () => {
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
    requestMock.query = {
      version: "8",
    };

    await retrieveTemplateOperationV1.handler(
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
    expect(auditLogSpy).toHaveBeenNthCalledWith(1, {
      userId: "clzsn6tao000611j50dexeob0",
      subject: { type: "Form", id: "clzsn6tao000611j50dexeob0" },
      event: "RetrieveTemplate",
    });
  });

  it("respond with error when form template does not exist", async () => {
    getFormTemplateMock.mockResolvedValueOnce(undefined);

    await retrieveTemplateOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.status).toHaveBeenCalledWith(404);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "Form template does not exist",
    });
  });

  it("respond with error when 'version' query parameter is not a number", async () => {
    getFormTemplateMock.mockRejectedValueOnce(new Error("custom error"));
    requestMock.query = {
      version: "hello",
    };

    await retrieveTemplateOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(responseMock.status).toHaveBeenCalledWith(400);
    expect(responseMock.json).toHaveBeenCalledWith({
      error: "URL parameter 'version' should be a number",
    });
  });

  it("pass error to next function when processing fails due to internal error", async () => {
    getFormTemplateMock.mockRejectedValueOnce(new Error("custom error"));

    await retrieveTemplateOperationV1.handler(
      requestMock,
      responseMock,
      nextMock,
    );

    expect(nextMock).toHaveBeenCalledWith(
      new Error(
        "[operation] Internal error while retrieving template. Params: formId = clzsn6tao000611j50dexeob0 ; version = undefined",
      ),
    );
  });
});
