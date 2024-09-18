import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";
import { logMessage } from "@lib/logging/logger.js";

export async function getFormTemplate(
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
        `[database] Failed to retrieve form template. FormId: ${formId}. Reason: ${JSON.stringify(
          error,
          Object.getOwnPropertyNames(error),
        )}`,
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
