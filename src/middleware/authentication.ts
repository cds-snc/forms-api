import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "@lib/idp/verifyAccessToken.js";
import { publishAuditLog } from "@lib/logging/auditLogs.js";
import { logMessage } from "@lib/logging/logger.js";

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const accessToken = request.headers.authorization?.split(" ")[1];
    const formId = request.params.formId;

    if (!accessToken) {
      response.sendStatus(401);
      return;
    }

    const verifiedAccessToken = await verifyAccessToken(accessToken);

    if (verifiedAccessToken === undefined) {
      response.sendStatus(403);
      return;
    }

    if (verifiedAccessToken.serviceUserId !== formId) {
      publishAuditLog(
        verifiedAccessToken.serviceUserId,
        { type: "Form", id: formId },
        "AccessDenied",
        "User does not have access to this form",
      );

      response.sendStatus(403);
      return;
    }

    if (verifiedAccessToken.expirationEpochTime < Date.now() / 1000) {
      publishAuditLog(
        verifiedAccessToken.serviceUserId,
        { type: "Form", id: formId },
        "AccessDenied",
        "Access token has expired",
      );

      response.status(401).json({ error: "Access token has expired" });
      return;
    }

    request.serviceUserId = verifiedAccessToken.serviceUserId;
    request.serviceAccountId = verifiedAccessToken.serviceAccountId;

    next();
  } catch (error) {
    logMessage.error(
      `[middleware] Internal error while authenticating user. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    response.sendStatus(500);
  }
}
