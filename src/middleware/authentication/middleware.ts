import type { NextFunction, Request, Response } from "express";
import { introspectToken } from "../../lib/idp/introspectToken";

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers?.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return response.sendStatus(401);
  }

  const tokenData = await introspectToken(token);
  const { username, exp } = tokenData;
  if (request.params.formId !== username) {
    return response.status(403);
  }

  if (!exp || exp < Date.now() / 1000) {
    return response.status(401).json({ message: "Token expired" });
  }

  next();
}
