import type { Request, Response, NextFunction } from "express";

export function globalErrorHandlerMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  return response.sendStatus(500);
}
