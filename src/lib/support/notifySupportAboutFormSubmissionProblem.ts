import { ENVIRONMENT_MODE, EnvironmentMode } from "@src/config";
import { FreshdeskServiceConnector } from "../freshdeskServiceConnector";

export async function notifySupportAboutFormSubmissionProblem(
  formId: string,
  submissionName: string,
  contactEmail: string,
  description: string,
  preferredLanguage: "en" | "fr",
): Promise<void> {
  try {
    await FreshdeskServiceConnector.getInstance().mainClient.createTicket(
      {
        name: contactEmail,
        email: contactEmail,
        type: "Problem",
        subject: "Problem with GC Forms / Problème avec Formulaires GC",
        tags: [tagFromEnvironmentMode(), "Forms_API_Submission"],
        description: prepareTicketDescription(
          formId,
          submissionName,
          contactEmail,
          description,
        ),
        preferredLanguage: preferredLanguage,
      },
      ENVIRONMENT_MODE,
    );
  } catch (error) {
    console.error(
      `[support] Failed to notify support about form submission problem. FormId: ${formId} / SubmissionName: ${submissionName} / Contact email: ${contactEmail}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    throw error;
  }
}

function tagFromEnvironmentMode(): string {
  switch (ENVIRONMENT_MODE) {
    case EnvironmentMode.Local:
      return "Forms_Dev";
    case EnvironmentMode.Staging:
      return "Forms_Staging";
    case EnvironmentMode.Production:
      return "Forms_Production";
  }
}

function prepareTicketDescription(
  formId: string,
  submissionName: string,
  contactEmail: string,
  description: string,
): string {
  return `
User (${contactEmail}) reported problems with some of the submissions for form \`${formId}\`.<br/>
<br/>
Submission names:<br/>
${submissionName}
<br/>
Description:<br/>
${description}<br/>
****<br/>
L'utilisateur (${contactEmail}) a signalé avoir rencontré des problèmes avec certaines des soumissions du formulaire \`${formId}\`.<br/>
<br/>
Nom des soumissions:<br/>
${submissionName}
<br/>
Description:<br/>
${description}<br/>
`;
}
