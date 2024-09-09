import { getPublicKey } from "./getPublicKey.js";
import type { FormSubmission } from "./dataStructures/formSubmission.js";
import {
  randomBytes,
  createCipheriv,
  createPublicKey,
  publicEncrypt,
} from "node:crypto";

export const encryptFormSubmission = async (
  serviceAccountId: string,
  submission: FormSubmission,
) => {
  const serviceAccountPublicKey = await getPublicKey(serviceAccountId);

  // Encrypt the submission with the public key
  const encryptionKey = randomBytes(32);
  const iv = randomBytes(16);

  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);

  const encryptedResponses = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(submission))),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const publicKey = createPublicKey({ key: serviceAccountPublicKey });
  const encryptedKey = publicEncrypt(publicKey, encryptionKey).toString(
    "base64",
  );
  const encryptedNonce = publicEncrypt(publicKey, iv).toString("base64");
  const encryptedAuthTag = publicEncrypt(publicKey, authTag).toString("base64");

  return {
    encryptedResponses,
    encryptedKey,
    encryptedNonce,
    encryptedAuthTag,
  };
};
