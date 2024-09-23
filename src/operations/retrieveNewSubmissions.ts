import type { Request, Response } from "express";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { logMessage } from "@lib/logging/logger.js";
import { publishAuditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

const MAXIMUM_NUMBER_OF_RETURNED_NEW_FORM_SUBMISSIONS: number = 100;

async function main(request: Request, response: Response): Promise<void> {
  const formId = request.params.formId;
  const serviceUserId = request.serviceUserId;

  try {
    const newFormSubmissions = await getNewFormSubmissions(
      formId,
      MAXIMUM_NUMBER_OF_RETURNED_NEW_FORM_SUBMISSIONS,
    );

    publishAuditLog(
      serviceUserId,
      { type: "Form", id: formId },
      "RetrieveNewResponses",
    );

    response.json(newFormSubmissions);
  } catch (error) {
    logMessage.error(
      `[operation] Internal error while retrieving new submissions. Params: formId = ${formId}. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    response.sendStatus(500);
  }
}

export const retrieveNewSubmissionsOperation: ApiOperation = {
  middleware: [],
  handler: main,
};
