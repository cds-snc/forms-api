import { describe, it, expect, beforeEach, vi } from "vitest";
import { notifySupportAboutFormSubmissionProblem } from "@lib/support/notifySupportAboutFormSubmissionProblem.js";
import { createFreshdeskTicket } from "@lib/integration/freshdeskConnector.js";
import { EnvironmentMode } from "@config";
import { logMessage } from "@lib/logging/logger.js";

vi.mock("@lib/integration/freshdeskConnector");
const createFreshdeskTicketMock = vi.mocked(createFreshdeskTicket);

describe("notifySupportAboutFormSubmissionProblem should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully notify support about a form submission problem if Freshdesk create ticket operation did not throw any error", async () => {
    createFreshdeskTicketMock.mockResolvedValueOnce();

    await expect(
      notifySupportAboutFormSubmissionProblem(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "test@test.com",
        "Here is my problem",
        "en",
        EnvironmentMode.Production,
      ),
    ).resolves.not.toThrow();

    expect(createFreshdeskTicketMock).toHaveBeenCalledWith({
      description: `
User (test@test.com) reported problems with some of the submissions for form \`clzamy5qv0000115huc4bh90m\`.<br/>
<br/>
Submission names:<br/>
01-08-a571
<br/>
Description:<br/>
Here is my problem<br/>
****<br/>
L'utilisateur (test@test.com) a signalé avoir rencontré des problèmes avec certaines des soumissions du formulaire \`clzamy5qv0000115huc4bh90m\`.<br/>
<br/>
Nom des soumissions:<br/>
01-08-a571
<br/>
Description:<br/>
Here is my problem<br/>
`,
      email: "test@test.com",
      name: "test@test.com",
      preferredLanguage: "en",
      subject: "Problem with GC Forms / Problème avec Formulaires GC",
      tags: ["Forms_Production", "Forms_API_Submission"],
      type: "Problem",
    });
  });

  it("throw an error if the createTicket function has an internal failure", async () => {
    const customError = new Error("custom error");
    createFreshdeskTicketMock.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() =>
      notifySupportAboutFormSubmissionProblem(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "test@test.com",
        "Here is my problem",
        "en",
        EnvironmentMode.Production,
      ),
    ).rejects.toThrowError(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[support] Failed to notify support about form submission problem. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571 / Contact email: test@test.com",
      ),
    );
  });
});
