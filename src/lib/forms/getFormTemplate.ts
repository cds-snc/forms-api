import { DatabaseConnectorClient } from "@lib/connectors/databaseConnector.js";
import { logMessage } from "@src/lib/logger.js";
import {
  type FormTemplate,
  formTemplateFromPostgreSqlResult,
} from "./dataStructures/formTemplate.js";

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
