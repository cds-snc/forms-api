import { describe, it, expect, beforeEach, vi } from "vitest";
import { notifySupportAboutFormSubmissionProblem } from "@lib/support/notifySupportAboutFormSubmissionProblem";
import {
  FreshdeskApiClient,
  FreshdeskServiceConnector,
} from "@lib/freshdeskServiceConnector";
import { EnvironmentMode } from "@src/config";

vi.mock("@lib/freshdeskServiceConnector");
const freshdeskServiceConnectorMock = vi.mocked(FreshdeskServiceConnector);
const createTicketMock = vi.mocked(FreshdeskApiClient.prototype.createTicket);

freshdeskServiceConnectorMock.getInstance.mockReturnValue({
  mainClient: {
    createTicket: createTicketMock,
  } as unknown as FreshdeskApiClient,
});

describe("notifySupportAboutFormSubmissionProblem should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully notify support about a form submission problem if Freshdesk create ticket operation did not throw any error", async () => {
    createTicketMock.mockResolvedValueOnce();

    await expect(
      notifySupportAboutFormSubmissionProblem(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "test@test.com",
        "Here is my problem",
        "en",
      ),
    ).resolves.not.toThrow();

    expect(createTicketMock).toHaveBeenCalledWith(
      {
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
      },
      EnvironmentMode.Production,
    );
  });

  it("throw an error if the createTicket function has an internal failure", async () => {
    createTicketMock.mockRejectedValueOnce(new Error("custom error"));
    const consoleErrorLogSpy = vi.spyOn(console, "error");

    await expect(() =>
      notifySupportAboutFormSubmissionProblem(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "test@test.com",
        "Here is my problem",
        "en",
      ),
    ).rejects.toThrowError("custom error");

    expect(consoleErrorLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[support] Failed to notify support about form submission problem. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571 / Contact email: test@test.com. Reason:",
      ),
    );
  });
});
