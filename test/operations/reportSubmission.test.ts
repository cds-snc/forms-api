import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { reportProblemWithFormSubmission } from "@lib/vault/reportProblemWithFormSubmission.js";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@lib/vault/types/exceptions.js";
import { notifySupportAboutFormSubmissionProblem } from "@lib/support/notifySupportAboutFormSubmissionProblem.js";
import { reportSubmissionOperation } from "@operations/reportSubmission.js";
import { logMessage } from "@lib/logging/logger.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as auditLogsModule from "@lib/logging/auditLogs.js";

vi.mock("@lib/vault/reportProblemWithFormSubmission");
const reportProblemWithFormSubmissionMock = vi.mocked(
  reportProblemWithFormSubmission,
);

vi.mock("@lib/support/notifySupportAboutFormSubmissionProblem");
const notifySupportAboutFormSubmissionProblemMock = vi.mocked(
  notifySupportAboutFormSubmissionProblem,
);

const logEventSpy = vi.spyOn(auditLogsModule, "logEvent");

describe("reportSubmissionOperation", () => {
  const { res: responseMock, next: nextMock, clearMockRes } = getMockRes();

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockRes();
  });

  describe("middleware should", () => {
    it("pass to the next function when payload is valid", async () => {
      const requestMock = getMockReq({
        body: {
          contactEmail: "clement.janin@cds-snc.ca",
          description: "here is my problem",
          preferredLanguage: "fr",
        },
      });

      for (const middleware of reportSubmissionOperation.middleware) {
        await middleware(requestMock, responseMock, nextMock);
      }

      // express.json + requestValidatorMiddleware
      expect(nextMock).toHaveBeenCalledTimes(2);
    });

    it.each([
      ["clement.janin@cds-snc", "here is my problem", "en"],
      ["clement.janin@cds-snc.ca", "yes", "en"],
      ["clement.janin@cds-snc.ca", "here is my problem", "ok"],
    ])(
      "respond with error when payload is invalid (testing contactEmail: %s / description: %s / preferredLanguage: %s)",
      async (
        contactEmail: string,
        description: string,
        preferredLanguage: string,
      ) => {
        const requestMock = getMockReq({
          body: {
            contactEmail: contactEmail,
            description: description,
            preferredLanguage: preferredLanguage,
          },
        });

        for (const middleware of reportSubmissionOperation.middleware) {
          await middleware(requestMock, responseMock, nextMock);
        }

        expect(responseMock.status).toHaveBeenCalledWith(400);
        expect(responseMock.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: "Invalid payload",
          }),
        );

        // express.json only
        expect(nextMock).toHaveBeenCalledOnce();
      },
    );
  });

  describe("handler should", () => {
    const requestMock = getMockReq({
      params: {
        formId: "clzsn6tao000611j50dexeob0",
        submissionName: "01-08-a571",
      },
      serviceUserId: "clzsn6tao000611j50dexeob0",
      body: {
        contactEmail: "test@test.com",
        description: "This is the problem",
        preferredLanguage: "en",
      },
    });

    it("respond with success when problem was successfully reported", async () => {
      reportProblemWithFormSubmissionMock.mockResolvedValueOnce();
      notifySupportAboutFormSubmissionProblemMock.mockResolvedValueOnce();

      await reportSubmissionOperation.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(responseMock.sendStatus).toHaveBeenCalledWith(200);
      expect(logEventSpy).toHaveBeenNthCalledWith(
        1,
        "clzsn6tao000611j50dexeob0",
        {
          id: "01-08-a571",
          type: "Response",
        },
        "IdentifyProblemResponse",
      );
    });

    it("respond with error when form submission does not exist", async () => {
      reportProblemWithFormSubmissionMock.mockRejectedValueOnce(
        new FormSubmissionNotFoundException(),
      );

      await reportSubmissionOperation.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(responseMock.status).toHaveBeenCalledWith(404);
      expect(responseMock.json).toHaveBeenCalledWith({
        error: "Form submission does not exist",
      });
    });

    it("respond with success when form submission is already reported as problematic", async () => {
      reportProblemWithFormSubmissionMock.mockRejectedValueOnce(
        new FormSubmissionAlreadyReportedAsProblematicException(),
      );

      await reportSubmissionOperation.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        info: "Form submission is already reported as problematic",
      });
    });

    it("respond with error when processing fails due to internal error caused by the reportProblemWithFormSubmission function", async () => {
      reportProblemWithFormSubmissionMock.mockRejectedValueOnce(
        new Error("custom error"),
      );
      const logMessageSpy = vi.spyOn(logMessage, "error");

      await reportSubmissionOperation.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
      expect(logMessageSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[operation] Internal error while reporting problem with submission: Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571. Reason:",
        ),
      );
    });

    it("respond with error when processing fails due to internal error caused by the notifySupportAboutFormSubmissionProblem function", async () => {
      notifySupportAboutFormSubmissionProblemMock.mockRejectedValueOnce(
        new Error("custom error"),
      );
      const logMessageSpy = vi.spyOn(logMessage, "error");

      await reportSubmissionOperation.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(responseMock.sendStatus).toHaveBeenCalledWith(500);
      expect(logMessageSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[operation] Internal error while reporting problem with submission: Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571. Reason:",
        ),
      );
    });
  });
});
