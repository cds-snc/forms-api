import { vi, describe, beforeEach, it, expect } from "vitest";
import { getMockReq, getMockRes } from "vitest-mock-express";
import { reportProblemWithFormSubmission } from "@lib/vault/reportProblemWithFormSubmission.js";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@lib/vault/types/exceptions.types.js";
import { notifySupportAboutFormSubmissionProblem } from "@lib/support/notifySupportAboutFormSubmissionProblem.js";
import { reportSubmissionOperationV1 } from "@operations/reportSubmission.v1.js";
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

const auditLogSpy = vi.spyOn(auditLogsModule, "auditLog");

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

      for (const middleware of reportSubmissionOperationV1.middleware) {
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

        for (const middleware of reportSubmissionOperationV1.middleware) {
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

      await reportSubmissionOperationV1.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(responseMock.sendStatus).toHaveBeenCalledWith(200);
      expect(auditLogSpy).toHaveBeenNthCalledWith(1, {
        userId: "clzsn6tao000611j50dexeob0",
        subject: { type: "Response", id: "01-08-a571" },
        event: "IdentifyProblemResponse",
      });
    });

    it("respond with error when form submission does not exist", async () => {
      reportProblemWithFormSubmissionMock.mockRejectedValueOnce(
        new FormSubmissionNotFoundException(),
      );

      await reportSubmissionOperationV1.handler(
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

      await reportSubmissionOperationV1.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.json).toHaveBeenCalledWith({
        info: "Form submission is already reported as problematic",
      });
    });

    it("pass error to next function when processing fails due to internal error caused by the reportProblemWithFormSubmission function", async () => {
      reportProblemWithFormSubmissionMock.mockRejectedValueOnce(
        new Error("custom error"),
      );

      await reportSubmissionOperationV1.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(nextMock).toHaveBeenCalledWith(
        new Error(
          "[operation] Internal error while reporting problem with submission: Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571",
        ),
      );
    });

    it("pass error to next function when processing fails due to internal error caused by the notifySupportAboutFormSubmissionProblem function", async () => {
      notifySupportAboutFormSubmissionProblemMock.mockRejectedValueOnce(
        new Error("custom error"),
      );

      await reportSubmissionOperationV1.handler(
        requestMock,
        responseMock,
        nextMock,
      );

      expect(nextMock).toHaveBeenCalledWith(
        new Error(
          "[operation] Internal error while reporting problem with submission: Params: formId = clzsn6tao000611j50dexeob0 ; submissionName = 01-08-a571",
        ),
      );
    });
  });
});
