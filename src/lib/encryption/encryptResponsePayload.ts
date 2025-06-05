import {
  randomBytes,
  createCipheriv,
  createPublicKey,
  publicEncrypt,
} from "node:crypto";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import { logMessage } from "@lib/logging/logger.js";

export interface EncryptedFormSubmission {
  encryptedResponses: string;
  encryptedKey: string;
  encryptedNonce: string;
  encryptedAuthTag: string;
}

export async function encryptResponsePayload(
  serviceAccountId: string,
  payload: Record<string, unknown>,
): Promise<EncryptedFormSubmission> {
  try {
    const serviceAccountPublicKey = await getPublicKey(serviceAccountId);

    const encryptionKey = randomBytes(32);
    const iv = randomBytes(12);

    const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);

    const encryptedResponses = Buffer.concat([
      cipher.update(Buffer.from(JSON.stringify(payload))),
      cipher.final(),
    ]).toString("base64");

    const authTag = cipher.getAuthTag();

    const publicKey = createPublicKey({ key: serviceAccountPublicKey });

    const publicEncryptKey = {
      key: publicKey,
      oaepHash: "sha256",
    };

    const encryptedKey = publicEncrypt(
      publicEncryptKey,
      encryptionKey,
    ).toString("base64");

    const encryptedNonce = publicEncrypt(publicEncryptKey, iv).toString(
      "base64",
    );

    const encryptedAuthTag = publicEncrypt(publicEncryptKey, authTag).toString(
      "base64",
    );

    return {
      encryptedResponses,
      encryptedKey,
      encryptedNonce,
      encryptedAuthTag,
    };
  } catch (error) {
    logMessage.error(error, "[encryption] Failed to encrypt form submission");
    throw error;
  }
}
