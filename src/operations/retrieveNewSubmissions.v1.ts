import { auditLog } from "@lib/logging/auditLogs.js";
import {
  RequestContextualStoreKey,
  retrieveRequestContextData,
} from "@lib/storage/requestContextualStore.js";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import type { NewFormSubmission } from "@lib/vault/types/formSubmission.types.js";
import type { ApiOperation } from "@operations/types/operation.js";
import type { NextFunction, Request, Response } from "express";

const MAXIMUM_NUMBER_OF_RETURNED_NEW_FORM_SUBMISSIONS: number = 100;

async function v1(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const formId = request.params.formId;
  const serviceUserId = retrieveRequestContextData(
    RequestContextualStoreKey.serviceUserId,
  );

  try {
    const newFormSubmissions = await getNewFormSubmissions(
      formId,
      MAXIMUM_NUMBER_OF_RETURNED_NEW_FORM_SUBMISSIONS,
    );

    const responsePayload = buildResponse(newFormSubmissions);

    auditLog({
      userId: serviceUserId,
      subject: { type: "Form", id: formId },
      event: "RetrieveNewResponses",
    });

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
  version: number;
}[] {
  return newFormSubmissions.map((item) => {
    return {
      name: item.name,
      createdAt: item.createdAt,
      version: item.version,
    };
  });
}

export const retrieveNewSubmissionsOperationV1: ApiOperation = {
  middleware: [],
  handler: v1,
};
