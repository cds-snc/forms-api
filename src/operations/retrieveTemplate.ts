import type { NextFunction, Request, Response } from "express";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

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

    auditLog(serviceUserId, { type: "Form", id: formId }, "RetrieveTemplate");

    response.json(formTemplate.jsonConfig);
  } catch (error) {
    next(
      new Error(
        `[operation] Internal error while retrieving template. Params: formId = ${formId}`,
        { cause: error },
      ),
    );
  }
}

export const retrieveTemplateOperation: Record<string, ApiOperation> = {
  v1: {
    middleware: [],
    handler: v1,
  },
};
