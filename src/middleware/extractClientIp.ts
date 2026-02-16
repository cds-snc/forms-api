import type { NextFunction, Request, Response } from "express";
import {
  RequestContextualStoreKey,
  saveRequestContextData,
} from "@lib/storage/requestContextualStore.js";
import type { IncomingHttpHeaders } from "node:http";

const FALLBACK_CLIENT_IP_ADDRESS = "0.0.0.0";

export function extractClientIpMiddleware(
  request: Request,
  _: Response,
  next: NextFunction,
): void {
  try {
    saveRequestContextData(
      RequestContextualStoreKey.clientIp,
      extractClientIpFromRequestHeaders(request.headers),
    );

    next();
  } catch (error) {
    next(
      new Error("[middleware][extract-client-ip] Internal error", {
        cause: error,
      }),
    );
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
  return (
    xForwardedForHeader.split(",").at(-1)?.trim() ?? FALLBACK_CLIENT_IP_ADDRESS
  );
}
