import type { NextFunction, Request, Response } from "express";
import {
  getIntrospectionCache,
  setIntrospectionCache,
} from "@lib/idp/introspectionCache";
import { introspectToken } from "@lib/idp/introspectToken";

export async function authenticationMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const accessToken = request.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return response.sendStatus(401);
  }

  const introspectionResult =
    (await getIntrospectionCache(accessToken)) ??
    (await introspectToken(accessToken));

  if (!introspectionResult) {
    return response.sendStatus(403);
  }

  const formId = request.params.formId;

  if (introspectionResult.username !== formId) {
    return response.sendStatus(403);
  }

  if (introspectionResult.exp < Date.now() / 1000) {
    return response.status(401).json({ message: "Token expired" });
  }

  await setIntrospectionCache(accessToken, introspectionResult);

  next();
}
