import { SignJWT } from "jose";
import axios from "axios";
import { createPrivateKey } from "node:crypto";
import { ZITADEL_APPLICATION_KEY, ZITADEL_DOMAIN } from "@src/config.js";
import { logMessage } from "@lib/logging/logger.js";

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

export function introspectAccessToken(
  accessToken: string,
): Promise<AccessTokenIntrospectionResult> {
  return generateSignedJwtToken()
    .then((jwtSignedToken) =>
      introspectOpaqueToken(jwtSignedToken, accessToken),
    )
    .catch((error) => {
      logMessage.error(error, "[zitadel] Failed to introspect access token");
      throw error;
    });
}

function generateSignedJwtToken(): Promise<string> {
  const jwtSigner = new SignJWT()
    .setProtectedHeader({ alg: algorithm, kid: keyId })
    .setIssuedAt()
    .setIssuer(clientId)
    .setSubject(clientId)
    .setAudience(ZITADEL_DOMAIN)
    .setExpirationTime("1 minute"); // long enough for the introspection to happen

  return jwtSigner.sign(privateKey);
}

function introspectOpaqueToken(
  jwtSignedToken: string,
  opaqueToken: string,
): Promise<AccessTokenIntrospectionResult> {
  return axios
    .post<AccessTokenIntrospectionResult>(
      `${ZITADEL_DOMAIN}/oauth/v2/introspect`,
      {
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: jwtSignedToken,
        token: opaqueToken,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000,
      },
    )
    .then((response) => response.data);
}
