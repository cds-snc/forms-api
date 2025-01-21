import type { NextFunction, Request, Response } from "express";
import { logMessage } from "@lib/logging/logger.js";

export const versionMiddleware = (version: number) => {
  return (req: Request, _: Response, next: NextFunction) => {
    logMessage.debug(
      `Version requested: ${req.params.version}, Current version: ${version}`,
    );
    // If the version parameter is not defined, then we assume the latest version
    if (req.params.version === undefined) {
      return next();
    }

    const requestVersion = Number.parseInt(req.params.version.substring(1)); // removes the "v" and turns into a number

    // This should never happen since the route checks for a valid version /v[0-9]/ but just in case
    if (Number.isNaN(requestVersion)) {
      return next(new Error("Invalid API version requested."));
    }
    // If the requested version is greater than or equal to the current version, then we can proceed
    if (requestVersion >= version) {
      return next();
    }

    return next("route"); // skip to the next route
  };
};
