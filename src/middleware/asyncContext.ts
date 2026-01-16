import { AsyncLocalStorage } from "node:async_hooks";
import type { NextFunction, Request, Response } from "express";
import type { IncomingHttpHeaders } from "node:http";

export const asyncContext = new AsyncLocalStorage<Map<string, string>>();

const FALLBACK_CLIENT_IP_ADDRESS = "0.0.0.0";

export async function asyncContextMiddleware(
  request: Request,
  _: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const storeContext = new Map<string, string>();

    storeContext.set(
      "clientIp",
      extractClientIpFromRequestHeaders(request.headers),
    );

    // Run the rest of the middleware chain and route handlers within the store's context
    asyncContext.run(storeContext, () => next());
  } catch (error) {
    next(
      new Error("[middleware][async-context] Internal error", {
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
  return xForwardedForHeader.split(",").at(-1) ?? FALLBACK_CLIENT_IP_ADDRESS;
}
