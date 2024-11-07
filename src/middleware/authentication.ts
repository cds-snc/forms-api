import type { NextFunction, Request, Response } from "express";
import {
  verifyAccessToken,
  AccessTokenExpiredError,
  AccessTokenInvalidError,
} from "@lib/idp/verifyAccessToken.js";

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const accessToken = request.headers.authorization?.split(" ")[1];
    const formId = request.params.formId;

    if (!accessToken) {
      // Authorization header is missing
      response
        .sendStatus(401)
        .json({ error: "Authorization header is missing" });
      return;
    }
    const verifiedAccessToken = await verifyAccessToken(accessToken, formId);

    request.serviceUserId = verifiedAccessToken.serviceUserId;
    request.serviceAccountId = verifiedAccessToken.serviceAccountId;

    next();
  } catch (error) {
    switch (error) {
      case error instanceof AccessTokenExpiredError: {
        response.status(401).json({ error: "Access token has expired" });
        return;
      }
      case error instanceof AccessTokenInvalidError: {
        response.sendStatus(403);
        return;
      }
      default:
        next(
          new Error("[middleware] Internal error while authenticating user", {
            cause: error,
          }),
        );
    }
  }
}
