import type { NextFunction, Request, Response } from "express";
import {
  getIntrospectionCache,
  setIntrospectionCache,
} from "@lib/idp/introspectionCache.js";
import { introspectToken } from "@lib/idp/introspectToken.js";
import { logEvent } from "@lib/logging/auditLogs.js";

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const accessToken = request.headers.authorization?.split(" ")[1];
  const formId = request.params.formId;

  if (!accessToken) {
    response.sendStatus(401);
    return;
  }

  const introspectionResult =
    (await getIntrospectionCache(accessToken)) ??
    (await introspectToken(accessToken));

  if (!introspectionResult) {
    response.sendStatus(403);
    return;
  }

  if (introspectionResult.serviceUserId !== formId) {
    logEvent(
      introspectionResult.serviceUserId,
      { type: "Form", id: formId },
      "AccessDenied",
      "User does not have access to this form",
    );

    response.sendStatus(403);
    return;
  }

  if (introspectionResult.exp < Date.now() / 1000) {
    logEvent(
      introspectionResult.serviceUserId,
      { type: "Form", id: formId },
      "AccessDenied",
      "Access token has expired",
    );

    response.status(401).json({ error: "Access token has expired" });
    return;
  }

  await setIntrospectionCache(accessToken, introspectionResult);

  request.serviceUserId = introspectionResult.serviceUserId;
  request.serviceAccountId = introspectionResult.serviceAccountId;

  next();
}
