import { getPublicKey } from "./getPublicKey.js";
import type { FormSubmission } from "./dataStructures/formSubmission.js";
import {
  randomBytes,
  createCipheriv,
  createPublicKey,
  publicEncrypt,
} from "node:crypto";

export interface EncryptedFormSubmission {
  encryptedResponses: string;
  encryptedKey: string;
  encryptedNonce: string;
  encryptedAuthTag: string;
}

export const encryptFormSubmission = async (
  serviceAccountId: string,
  submission: FormSubmission,
): Promise<EncryptedFormSubmission> => {
  const serviceAccountPublicKey = await getPublicKey(serviceAccountId);

  // Encrypt the submission with the public key
  const encryptionKey = randomBytes(32);
  const iv = randomBytes(12);

  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);

  const encryptedResponses = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(submission))),
    cipher.final(),
  ]).toString("base64");

  const authTag = cipher.getAuthTag();

  const publicKey = createPublicKey({ key: serviceAccountPublicKey });

  const publicEncryptKey = {
    key: publicKey,
    oaepHash: "sha256",
  };

  const encryptedKey = publicEncrypt(publicEncryptKey, encryptionKey).toString(
    "base64",
  );
  const encryptedNonce = publicEncrypt(publicEncryptKey, iv).toString("base64");
  const encryptedAuthTag = publicEncrypt(publicEncryptKey, authTag).toString(
    "base64",
  );

  return {
    encryptedResponses,
    encryptedKey,
    encryptedNonce,
    encryptedAuthTag,
  };
};
