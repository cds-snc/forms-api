import type { NextFunction, Request, Response } from "express";
import {
  verifyAccessToken,
  AccessTokenExpiredError,
  AccessTokenInvalidError,
  AccessControlError,
  AccessTokenMalformedError,
} from "@lib/idp/verifyAccessToken.js";
import {
  RequestContextualStoreKey,
  saveRequestContextData,
} from "@lib/storage/requestContextualStore.js";

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const accessToken = request.headers.authorization?.split(" ")[1];
    const formId = request.params.formId;

    if (!accessToken) {
      response.status(401).json({ error: "Authorization header is missing" });
      return;
    }

    const verifiedAccessToken = await verifyAccessToken(accessToken, formId);

    saveRequestContextData(
      RequestContextualStoreKey.ServiceUserId,
      verifiedAccessToken.serviceUserId,
    );
    saveRequestContextData(
      RequestContextualStoreKey.ServiceAccountId,
      verifiedAccessToken.serviceAccountId,
    );

    next();
  } catch (error) {
    switch (true) {
      case error instanceof AccessTokenExpiredError: {
        response.status(401).json({ error: "Access token has expired" });
        return;
      }
      case error instanceof AccessTokenInvalidError:
      case error instanceof AccessTokenMalformedError:
      case error instanceof AccessControlError: {
        response.sendStatus(403);
        return;
      }
      default:
        next(
          new Error("[middleware][authentication] Internal error", {
            cause: error,
          }),
        );
    }
  }
}
