import type { NextFunction, Request, Response } from "express";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";

const MAXIMUM_NUMBER_OF_RETURNED_NEW_FORM_SUBMISSIONS: number = 100;

async function main(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const formId = request.params.formId;
  const serviceUserId = request.serviceUserId;

  try {
    const newFormSubmissions = await getNewFormSubmissions(
      formId,
      MAXIMUM_NUMBER_OF_RETURNED_NEW_FORM_SUBMISSIONS,
    );

    auditLog(
      serviceUserId,
      { type: "Form", id: formId },
      "RetrieveNewResponses",
    );

    response.json(newFormSubmissions);
  } catch (error) {
    next(
      new Error(
        `[operation] Internal error while retrieving new submissions. Params: formId = ${formId}`,
        { cause: error },
      ),
    );
  }
}

export const retrieveNewSubmissionsOperation: ApiOperation = {
  middleware: [],
  handler: main,
};
