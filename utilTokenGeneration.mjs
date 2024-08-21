/*
 * This script is used to generate a JWT token and exchange it for an opaque token
 */
import { SignJWT, importPKCS8 } from "jose";
import { createRequire } from "node:module";
import "dotenv/config";
import axios from "axios";
import { exit } from "node:process";
import { readFile } from 'fs/promises';


const require = createRequire(import.meta.url);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (query) => new Promise((resolve) => readline.question(query, resolve));

async function getPrivateKeyData() {
  try {
    // Prompt for the file path
    const filePath = await prompt('Enter private key file: ');

    // Validate input
    if (!filePath.trim()) {
      throw new Error('File path cannot be empty.');
    }

    // Read the file
    const fileContent = await readFile(filePath.trim(), 'utf8');

    // Parse JSON content
    const data = JSON.parse(fileContent);

    return data;
  } catch (error) {
    console.error('An error occurred:', error.message);
    throw error; // Re-throw the error after logging it
  }
}

const main = async () => {
  try {

    const data = await getPrivateKeyData();

    const keyId = data.keyId.trim();
    const key = data.key.trim();
    const userId = data.userId.trim();

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
        },
      )
      .catch((e) => {
        console.error(e);
      });

    console.log(token.data.access_token);
    exit();
  } catch (e) {
    console.log(e);
  }
};

main();
