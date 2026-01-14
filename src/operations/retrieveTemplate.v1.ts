import type { NextFunction, Request, Response } from "express";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";

async function v1(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const formId = request.params.formId;
  const serviceUserId = request.serviceUserId;

  try {
    const formTemplate = await getFormTemplate(formId);

    if (formTemplate === undefined) {
      response.status(404).json({ error: "Form template does not exist" });
      return;
    }

    const responsePayload = buildResponse(formTemplate);

    auditLog({
      userId: serviceUserId,
      subject: { type: "Form", id: formId },
      event: "RetrieveTemplate",
      clientIp: request.clientIp,
    });

    response.json(responsePayload);
  } catch (error) {
    next(
      new Error(
        `[operation] Internal error while retrieving template. Params: formId = ${formId}`,
        { cause: error },
      ),
    );
  }
}

function buildResponse(formTemplate: FormTemplate): Record<string, unknown> {
  return formTemplate.jsonConfig;
}

export const retrieveTemplateOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
