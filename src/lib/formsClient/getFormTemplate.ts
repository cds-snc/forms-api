import { databaseConnector } from "@lib/integration/databaseConnector.js";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";
import { logMessage } from "@lib/logging/logger.js";

export async function getFormTemplate(
  formId: string,
): Promise<FormTemplate | undefined> {
  try {
    const results = await databaseConnector.executeSqlStatement()<
      FormTemplate[]
    >`SELECT "jsonConfig" FROM "Template" WHERE id = ${formId}`;

    if (results.length !== 1) {
      return undefined;
    }

    return results[0];
  } catch (error) {
    logMessage.error(
      error,
      `[formsClient] Failed to retrieve form template. FormId: ${formId}`,
    );

    throw error;
  }
}
