import { SignJWT } from "jose";
import axios, { type AxiosError } from "axios";
import { createPrivateKey } from "node:crypto";
import { ZITADEL_APPLICATION_KEY, ZITADEL_DOMAIN } from "@src/config.js";
import { logMessage } from "@src/lib/logger.js";

export type IntrospectionResult = {
  serviceUserId: string;
  exp: number;
  serviceAccountId: string;
};

const algorithm = "RS256";
const keyId = JSON.parse(ZITADEL_APPLICATION_KEY).keyId as string;
const clientId = JSON.parse(ZITADEL_APPLICATION_KEY).clientId as string;
const privateKey = createPrivateKey({
  key: JSON.parse(ZITADEL_APPLICATION_KEY).key,
});
const introspectionEndpoint = `${ZITADEL_DOMAIN}/oauth/v2/introspect`;

export async function introspectToken(
  token: string,
): Promise<IntrospectionResult | undefined> {
  const jwt = await new SignJWT()
    .setProtectedHeader({ alg: algorithm, kid: keyId })
    .setIssuedAt()
    .setIssuer(clientId)
    .setSubject(clientId)
    .setAudience(ZITADEL_DOMAIN)
    .setExpirationTime("1 minute") // long enough for the introspection to happen
    .sign(privateKey);

  try {
    const response = await axios.post(
      introspectionEndpoint,
      new URLSearchParams({
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: jwt,
        token: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const introspectionResponse = response.data as Record<string, unknown>;

    const isTokenActive = introspectionResponse.active as boolean;

    if (!isTokenActive) {
      return undefined;
    }

    return {
      serviceUserId: introspectionResponse.username as string,
      exp: introspectionResponse.exp as number,
      serviceAccountId: introspectionResponse.sub as string,
    };
  } catch (error) {
    logMessage.error((error as AxiosError).response?.data);
    return undefined;
  }
}
