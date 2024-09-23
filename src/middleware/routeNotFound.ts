import type { Request, Response } from "express";

export function routeNotFoundMiddleware(
  _request: Request,
  response: Response,
): void {
  response.sendStatus(404);
}
