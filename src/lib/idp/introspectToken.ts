import { SignJWT } from "jose";
import axios from "axios";
// biome-ignore lint/correctness/noNodejsModules: we need the node crypto module
import crypto from "node:crypto";

export async function introspectToken(token: string) {
  const alg = "RS256";
  const privateKey = crypto.createPrivateKey({
    key: JSON.parse(`${process.env.ZITADEL_APPLICATION_KEY}`).key,
  });
  const clientId = JSON.parse(
    `${process.env.ZITADEL_APPLICATION_KEY}`,
  ).clientId;
  const kid = JSON.parse(`${process.env.ZITADEL_APPLICATION_KEY}`).keyId;

  const jwt = await new SignJWT()
    .setProtectedHeader({ alg, kid })
    .setIssuedAt()
    .setIssuer(clientId)
    .setSubject(clientId)
    .setAudience(`${process.env.ZITADEL_DOMAIN}`)
    .setExpirationTime("1 minute") // long enough for the introspection to happen
    .sign(privateKey);

  const introspectionEndpoint = `${process.env.ZITADEL_DOMAIN}/oauth/v2/introspect`;

  const tokenData = await axios
    .post(
      introspectionEndpoint,
      new URLSearchParams({
        // biome-ignore lint/style/useNamingConvention: by the spec
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        // biome-ignore lint/style/useNamingConvention: by the spec
        client_assertion: jwt,
        token: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
    .then((res) => res.data)
    .catch((err) => {
      console.error(err.response.data);
      return null;
    });
  return tokenData;
}
