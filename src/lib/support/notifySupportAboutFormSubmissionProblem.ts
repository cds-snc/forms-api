import { EnvironmentMode } from "@config";
import { createFreshdeskTicket } from "@lib/integration/freshdeskConnector.js";
import { logMessage } from "@lib/logging/logger.js";

export async function notifySupportAboutFormSubmissionProblem(
  formId: string,
  submissionName: string,
  contactEmail: string,
  description: string,
  preferredLanguage: "en" | "fr",
  environmentMode: EnvironmentMode,
): Promise<void> {
  try {
    await createFreshdeskTicket({
      name: contactEmail,
      email: contactEmail,
      type: "Problem",
      subject: "Problem with GC Forms / Problème avec Formulaires GC",
      tags: [tagFromEnvironmentMode(environmentMode), "Forms_API_Submission"],
      description: prepareTicketDescription(
        formId,
        submissionName,
        contactEmail,
        description,
      ),
      preferredLanguage: preferredLanguage,
    });
  } catch (error) {
    logMessage.info(
      error,
      `[support] Failed to notify support about form submission problem. FormId: ${formId} / SubmissionName: ${submissionName} / Contact email: ${contactEmail} / Description: ${description}`,
    );

    throw error;
  }
}

function tagFromEnvironmentMode(environmentMode: EnvironmentMode): string {
  switch (environmentMode) {
    case EnvironmentMode.local:
      return "Forms_Dev";
    case EnvironmentMode.staging:
      return "Forms_Staging";
    case EnvironmentMode.production:
      return "Forms_Production";
    default:
      throw new Error(`Unsupported environment mode: ${environmentMode}`);
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
