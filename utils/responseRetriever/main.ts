/* eslint-disable no-console */

import { config } from "dotenv";
import axios from "axios";
import readline from "node:readline";
import { SignJWT } from "jose";
import gcformsPrivate from "./private_api_key.json";
import crypto from "node:crypto";

type EncryptedSubmission = {
  encryptedResponses: string;
  encryptedNonce: string;
  encryptedKey: string;
  encryptedAuthTag: string;
};

function getValue(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

const getAccessToken = async () => {
  const alg = "RS256";
  const privateKey = crypto.createPrivateKey({ key: gcformsPrivate.key });
  const serviceUserId = gcformsPrivate.userId;
  const kid = gcformsPrivate.keyId;

  const jwt = await new SignJWT()
    .setProtectedHeader({ alg, kid })
    .setIssuedAt()
    .setIssuer(serviceUserId)
    .setSubject(serviceUserId)
    .setAudience(process.env.IDENTITY_PROVIDER ?? "")
    .setExpirationTime("1h")
    .sign(privateKey);

  return axios
    .post(
      `${process.env.IDENTITY_PROVIDER}/oauth/v2/token`,
      new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
        scope: `openid profile urn:zitadel:iam:org:project:id:${process.env.PROJECT_ID}:aud`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
    .then((res) => res.data.access_token)
    .catch((e) => {
      console.error(e.response);
    });
};

const retrieveSubmission = async (
  formId: string,
  submissionName: string,
  accessToken: string,
): Promise<EncryptedSubmission> => {
  return axios
    .get(
      `${process.env.GCFORMS_API_URL}/forms/${formId}/submission/${submissionName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    )
    .then((res) => res.data)
    .catch((e) => {
      console.error(e.response.data);
    });
};

const decryptSubmission = (
  {
    encryptedKey,
    encryptedAuthTag,
    encryptedNonce,
    encryptedResponses,
  }: EncryptedSubmission,
  privateKey: crypto.KeyObject,
) => {
  const decryptedKey = crypto.privateDecrypt(
    privateKey,
    Buffer.from(encryptedKey, "base64"),
  );

  const decryptedNonce = crypto.privateDecrypt(
    privateKey,
    Buffer.from(encryptedNonce, "base64"),
  );
  const authTag = crypto.privateDecrypt(
    privateKey,
    Buffer.from(encryptedAuthTag, "base64"),
  );

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    decryptedKey,
    decryptedNonce,
  );
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedResponses, "base64")),
    decipher.final(),
  ]).toString("utf-8");
};

const main = async () => {
  try {
    const identityProvider = process.env.IDENTITY_PROVIDER;

    if (!identityProvider) {
      throw new Error("Identity provider not set in .env file");
    }

    const menuSelection = await getValue(`I want to:
(1) Retrieve a form submission
(2) Generate and dispaly an Access Token
Selection (1): `);

    if (menuSelection === "2") {
      const accessToken = await getAccessToken();
      console.info(`Access Token: \n${accessToken}`);
      return;
    }

    const formId = await getValue("Form ID to retrieve responses for: ");
    const accessToken = await getAccessToken();

    const namesToRetrieve: { name: string; createdAt: number }[] = await axios
      .get(`${process.env.GCFORMS_API_URL}/forms/${formId}/submission/new`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })
      .then((res) => res.data)
      .catch((e) => {
        console.error(e.response.data);
      });
    console.info("Retrieving responses");
    const retrieveTimeStart = Date.now();
    const encryptedSubmissions = await Promise.all(
      namesToRetrieve.map(async (submission) => {
        const response = await retrieveSubmission(
          formId,
          submission.name,
          accessToken,
        );
        return response;
      }),
    );

    const retrieveTimeEnd = Date.now();
    console.info(
      `Retrieving responses took ${retrieveTimeEnd - retrieveTimeStart}ms`,
    );
    console.info("Decrypting responses.");
    const privateKey = crypto.createPrivateKey({ key: gcformsPrivate.key });
    const decryptTimeStart = Date.now();
    const decryptedSubmissions = encryptedSubmissions.map(
      (encryptedSubmission) => {
        return decryptSubmission(encryptedSubmission, privateKey);
      },
    );

    const decryptTimeEnd = Date.now();
    console.info(
      `Decrypting responses took ${decryptTimeEnd - decryptTimeStart}ms`,
    );

    console.info("Decrypted responses:");
    for (const submission of decryptedSubmissions) {
      console.info(submission);
    }

    console.info(
      `Time taken to download and decrypt: ${decryptTimeEnd - retrieveTimeStart}ms`,
    );
  } catch (e) {
    console.error(e);
  }
};

// config() adds the .env variables to process.env
config();

main();
