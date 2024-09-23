import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";
import { logMessage } from "@lib/logging/logger.js";

export function getFormTemplate(
  formId: string,
): Promise<FormTemplate | undefined> {
  return DatabaseConnectorClient.oneOrNone<Record<string, unknown>>(
    'SELECT "jsonConfig" FROM "Template" WHERE id = $1',
    [formId],
  )
    .then((result) => {
      if (result === null) {
        return undefined;
      }

      return formTemplateFromPostgreSqlResult(result);
    })
    .catch((error) => {
      logMessage.error(
        error,
        `[formsClient] Failed to retrieve form template. FormId: ${formId}`,
      );

      throw error;
    });
}

function formTemplateFromPostgreSqlResult(
  response: Record<string, unknown>,
): FormTemplate {
  return {
    jsonConfig: response.jsonConfig as Record<string, unknown>,
  };
}
