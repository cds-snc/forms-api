import { SignJWT } from "jose";
import { createPrivateKey } from "node:crypto";
import {
  ZITADEL_APPLICATION_KEY,
  ZITADEL_TRUSTED_DOMAIN,
  ZITADEL_URL,
} from "@config";
import { logMessage } from "@lib/logging/logger.js";
import got from "got";

export type AccessTokenIntrospectionResult = {
  active: boolean;
  exp?: number;
  sub?: string;
  username?: string;
};

const algorithm = "RS256";
const keyId = JSON.parse(ZITADEL_APPLICATION_KEY).keyId as string;
const clientId = JSON.parse(ZITADEL_APPLICATION_KEY).clientId as string;
const privateKey = createPrivateKey({
  key: JSON.parse(ZITADEL_APPLICATION_KEY).key,
});

export class ZitadelConnectionError extends Error {
  constructor() {
    super("Failed to connect to Zitadel");
    this.name = "ZitadelConnectionError";
  }
}

export function introspectAccessToken(
  accessToken: string,
): Promise<AccessTokenIntrospectionResult> {
  return generateSignedJwtToken()
    .then((jwtSignedToken) =>
      introspectOpaqueToken(jwtSignedToken, accessToken),
    )
    .catch((error) => {
      logMessage.info(
        error,
        "[zitadel-connector] Failed to introspect access token",
      );

      throw new ZitadelConnectionError();
    });
}

function generateSignedJwtToken(): Promise<string> {
  const jwtSigner = new SignJWT()
    .setProtectedHeader({ alg: algorithm, kid: keyId })
    .setIssuedAt()
    .setIssuer(clientId)
    .setSubject(clientId)
    .setAudience(`https://${ZITADEL_TRUSTED_DOMAIN}`) // Expected audience for the JWT token is the IdP external domain
    .setExpirationTime("1 minute"); // long enough for the introspection to happen

  return jwtSigner.sign(privateKey);
}

function introspectOpaqueToken(
  jwtSignedToken: string,
  opaqueToken: string,
): Promise<AccessTokenIntrospectionResult> {
  return got
    .post(`${ZITADEL_URL}/oauth/v2/introspect`, {
      http2: true,
      timeout: { request: 5000 },
      retry: { limit: 1 },
      headers: {
        Host: ZITADEL_TRUSTED_DOMAIN, // This is required by Zitadel to accept requests. See https://zitadel.com/docs/self-hosting/manage/custom-domain#standard-config
      },
      form: {
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: jwtSignedToken,
        token: opaqueToken,
      },
    })
    .json<AccessTokenIntrospectionResult>();
}
