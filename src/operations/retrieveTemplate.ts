import type { Request, Response } from "express";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { logMessage } from "@lib/logging/logger.js";
import { publishAuditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

async function main(request: Request, response: Response): Promise<void> {
  const formId = request.params.formId;
  const serviceUserId = request.serviceUserId;

  try {
    const formTemplate = await getFormTemplate(formId);

    if (formTemplate === undefined) {
      response.status(404).json({ error: "Form template does not exist" });
      return;
    }

    publishAuditLog(
      serviceUserId,
      { type: "Form", id: formId },
      "RetrieveTemplate",
    );

    response.json(formTemplate.jsonConfig);
  } catch (error) {
    logMessage.error(
      `[operation] Internal error while retrieving template. Params: formId = ${formId}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    response.sendStatus(500);
  }
}

export const retrieveTemplateOperation: ApiOperation = {
  middleware: [],
  handler: main,
};
