import { NextFunction, Request, Response } from "express";
import { SignJWT } from "jose";
import axios from "axios";
import crypto from "crypto";

async function main(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return response.sendStatus(401);

  const tokenData = await introspectToken(token);

  const { username, exp } = tokenData;
  if (request.params.formId !== username) {
    response.status(403).json({ message: "Invalid token" });
    return;
  }

  if (!exp || exp < Date.now() / 1000) {
    response.status(401).json({ message: "Token expired" });
    return;
  }

  next();
}

async function introspectToken(token: string) {
  const alg = "RS256";
  const privateKey = crypto.createPrivateKey({
    key: JSON.parse(`${process.env.ZITADEL_APPLICATION_KEY}`).key,
  });
  const clientId = JSON.parse(`${process.env.ZITADEL_APPLICATION_KEY}`).clientId;
  const kid = JSON.parse(`${process.env.ZITADEL_APPLICATION_KEY}`).keyId;

  const jwt = await new SignJWT()
    .setProtectedHeader({ alg, kid })
    .setIssuedAt()
    .setIssuer(clientId)
    .setSubject(clientId)
    .setAudience(`${process.env.ZITADEL_DOMAIN}`)
    .setExpirationTime("5m")
    .sign(privateKey);

  const introspectionEndpoint = `${process.env.ZITADEL_DOMAIN}/oauth/v2/introspect`;
  const tokenData = await axios
    .post(
      introspectionEndpoint,
      new URLSearchParams({
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: jwt,
        token: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((res) => res.data)
    .catch((err) => {
      console.error(err.response.data);
      return null;
    });
  return tokenData;
}

export default main;
