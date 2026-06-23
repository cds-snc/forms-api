import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import {
  RequestContextualStoreKey,
  retrieveRequestContextData,
} from "@lib/storage/requestContextualStore.js";
import type { ApiOperation } from "@operations/types/operation.js";
import type { NextFunction, Request, Response } from "express";

async function v1(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const formId = request.params.formId;
  const serviceUserId = retrieveRequestContextData(
    RequestContextualStoreKey.serviceUserId,
  );
  const version = Number(request.query.version ?? 1);

  try {
    if (Number.isNaN(version)) {
      response
        .status(400)
        .json({ error: "URL parameter 'version' should be a number" });
      return;
    }

    const formTemplate = await getFormTemplate(formId, version);

    if (formTemplate === undefined) {
      response.status(404).json({ error: "Form template does not exist" });
      return;
    }

    const responsePayload = buildResponse(formTemplate);

    auditLog({
      userId: serviceUserId,
      subject: { type: "Form", id: formId },
      event: "RetrieveTemplate",
    });

    response.json(responsePayload);
  } catch (error) {
    next(
      new Error(
        `[operation] Internal error while retrieving template. Params: formId = ${formId} ; version = ${request.query.version}`,
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
