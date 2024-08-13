import type { NextFunction, Request, Response } from "express";

export function authenticationMiddleware(
  _request: Request,
  _response: Response,
  next: NextFunction,
) {
  next();
}
