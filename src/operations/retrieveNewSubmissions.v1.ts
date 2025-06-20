import type { NextFunction, Request, Response } from "express";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { auditLog } from "@lib/logging/auditLogs.js";
import type { ApiOperation } from "@operations/types/operation.js";
import type { NewFormSubmission } from "@lib/vault/types/formSubmission.types.js";

const MAXIMUM_NUMBER_OF_RETURNED_NEW_FORM_SUBMISSIONS: number = 100;

async function v1(
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

    const responsePayload = buildResponse(newFormSubmissions);

    auditLog(
      serviceUserId,
      { type: "Form", id: formId },
      "RetrieveNewResponses",
    );

    response.json(responsePayload);
  } catch (error) {
    next(
      new Error(
        `[operation] Internal error while retrieving new submissions. Params: formId = ${formId}`,
        { cause: error },
      ),
    );
  }
}

function buildResponse(newFormSubmissions: NewFormSubmission[]): {
  name: string;
  createdAt: number;
}[] {
  return newFormSubmissions.map((item) => {
    return { name: item.name, createdAt: item.createdAt };
  });
}

export const retrieveNewSubmissionsOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
