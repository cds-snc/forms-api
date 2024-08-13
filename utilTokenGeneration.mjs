/*
 * This script is used to generate a JWT token and exchange it for an opaque token
 */
import { SignJWT, importPKCS8 } from "jose";
import { createRequire } from "node:module";
import "dotenv/config";
import axios from "axios";

const require = createRequire(import.meta.url);

const main = async () => {
  try {
    const { key, keyId, userId } = require("./clzctlsjk00001y2t0o7dwnv9_private_api_key.json");
    const alg = "RS256";
    const privateKey = await importPKCS8(key, alg);

    const jwt = await new SignJWT()
      .setProtectedHeader({ alg, kid: keyId })
      .setIssuedAt()
      .setAudience(process.env.ZITADEL_DOMAIN)
      .setIssuer(userId)
      .setSubject(userId)
      .setExpirationTime("5 minutes")
      .sign(privateKey);

    const reqData = {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      scope: `openid profile urn:zitadel:iam:org:project:id:${process.env.PROJECT_ID}:aud`,
      assertion: jwt,
    };

    const token = await axios
      .post(
        process.env.ZITADEL_TOKEN_URL,
        {},
        {
          params: reqData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      )
      .catch((e) => {
        console.error(e);
      });

    console.log(token.data);
  } catch (e) {
    console.log(e);
  }
};

main();
