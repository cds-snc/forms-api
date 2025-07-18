import {
  randomBytes,
  createCipheriv,
  createPublicKey,
  publicEncrypt,
} from "node:crypto";
import { logMessage } from "@lib/logging/logger.js";

export interface EncryptedResponse {
  encryptedKey: string;
  encryptedNonce: string;
  encryptedAuthTag: string;
  encryptedResponses: string;
}

export function encryptResponse(
  serviceAccountPublicKey: string,
  payload: string,
): EncryptedResponse {
  try {
    const encryptionKey = randomBytes(32);
    const iv = randomBytes(12);

    const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);

    const encryptedResponses = Buffer.concat([
      cipher.update(Buffer.from(payload)),
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
      encryptedKey,
      encryptedNonce,
      encryptedAuthTag,
      encryptedResponses,
    };
  } catch (error) {
    logMessage.error(error, "[encryption] Failed to encrypt response");
    throw error;
  }
}
