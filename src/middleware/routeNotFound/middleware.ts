import type { Request, Response } from "express";

export function routeNotFoundMiddleware(_request: Request, response: Response) {
  return response.sendStatus(404);
}
