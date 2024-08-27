import { getPublicKey } from "./getPublicKey";
import type { FormSubmission } from "./dataStructures/formSubmission";
import crypto from "crypto";

export const encryptFormSubmission = async (
  serviceAccountId: string,
  submission: FormSubmission
) => {
  const serviceAccountPublicKey = await getPublicKey(serviceAccountId);

  // Encrypt the submission with the public key
  const encryptionKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

  const encryptedResponses = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(submission))),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const publicKey = crypto.createPublicKey({ key: serviceAccountPublicKey });
  const encryptedKey = crypto.publicEncrypt(publicKey, encryptionKey).toString("base64");
  const encryptedIV = crypto.publicEncrypt(publicKey, iv).toString("base64");
  const encryptedAuthTag = crypto.publicEncrypt(publicKey, authTag).toString("base64");

  return {
    encryptedResponses,
    encryptedKey,
    encryptedIV,
    encryptedAuthTag,
  };
};
