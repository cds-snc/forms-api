import type { NextFunction, Request, Response } from "express";
import { introspectToken } from "@lib/idp/introspectToken.js";
import {
  getIntrospectionCache,
  setIntrospectionCache,
} from "@lib/idp/introspectionCache.js";
import { logEvent } from "@src/lib/auditLogs.js";

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const accessToken = request.headers.authorization?.split(" ")[1];
  const formId = request.params.formId;

  if (!accessToken) {
    return response.sendStatus(401);
  }

  const introspectionResult =
    (await getIntrospectionCache(accessToken)) ??
    (await introspectToken(accessToken));

  if (!introspectionResult) {
    return response.sendStatus(403);
  }

  if (introspectionResult.serviceUserId !== formId) {
    logEvent(
      introspectionResult.serviceUserId,
      { type: "Form", id: formId },
      "AccessDenied",
      "User does not have access to this form",
    );
    return response.sendStatus(403);
  }

  if (introspectionResult.exp < Date.now() / 1000) {
    logEvent(
      introspectionResult.serviceUserId,
      { type: "Form", id: formId },
      "AccessDenied",
      "Access token has expired",
    );
    return response.status(401).json({ error: "Access token has expired" });
  }

  await setIntrospectionCache(accessToken, introspectionResult);

  request.serviceUserId = introspectionResult.serviceUserId;
  request.serviceAccountId = introspectionResult.serviceAccountId;

  next();
}
