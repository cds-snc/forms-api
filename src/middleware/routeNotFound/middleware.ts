import type { Request, Response } from "express";

export function routeNotFoundMiddleware(_request: Request, response: Response) {
  response.sendStatus(404);
}
