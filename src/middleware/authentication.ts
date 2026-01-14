import type { NextFunction, Request, Response } from "express";
import {
  verifyAccessToken,
  AccessTokenExpiredError,
  AccessTokenInvalidError,
  AccessControlError,
  AccessTokenMalformedError,
} from "@lib/idp/verifyAccessToken.js";
import type { IncomingHttpHeaders } from "node:http";

const FALLBACK_CLIENT_IP_ADDRESS = "0.0.0.0";

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

    const clientIp = extractClientIpFromRequestHeaders(request.headers);

    const verifiedAccessToken = await verifyAccessToken(
      accessToken,
      formId,
      clientIp,
    );

    request.serviceUserId = verifiedAccessToken.serviceUserId;
    request.serviceAccountId = verifiedAccessToken.serviceAccountId;
    request.clientIp = clientIp;

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

function extractClientIpFromRequestHeaders(
  requestHeaders: IncomingHttpHeaders,
): string {
  const xForwardedForHeader = requestHeaders["x-forwarded-for"];

  if (xForwardedForHeader === undefined || Array.isArray(xForwardedForHeader)) {
    return FALLBACK_CLIENT_IP_ADDRESS;
  }

  /**
   * Only consider last IP as the source of truth as it has been added by AWS ECS Load balancer
   * See https://docs.aws.amazon.com/elasticloadbalancing/latest/application/x-forwarded-headers.html#x-forwarded-for-append
   */
  return xForwardedForHeader.split(",").at(-1) ?? FALLBACK_CLIENT_IP_ADDRESS;
}
