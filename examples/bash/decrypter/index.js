import { createDecipheriv } from "node:crypto";

/**
 * Perform  AES-256-GCM decryption on the encrypted response data.
 * @param {Buffer} encryptedResponses Encrypted response data to decrypt.
 * @param {Buffer} key Key that was used to encrypt the responses.
 * @param {Buffer} iv Initialization vector (nonce) that was part of the encryption process.
 * @param {Buffer} authTag Authentication tag used to verify that the data has not been tampered with.
 * @returns Decrypted response data.
 */
function decryptFormSubmission(encryptedResponses, key, iv, authTag) {
  const gcmDecipher = createDecipheriv("aes-256-gcm", key, iv);

  gcmDecipher.setAuthTag(authTag);

  const decryptedData = Buffer.concat([
    gcmDecipher.update(encryptedResponses),
    gcmDecipher.final(),
  ]);

  return decryptedData.toString("utf8");
}

// Get the command line arguments and convert them to binary data
const args = process.argv.slice(2);
const encryptedResponses = Buffer.from(args[0], "base64");
const key = Buffer.from(args[1], "base64");
const iv = Buffer.from(args[2], "base64");
const authTag = Buffer.from(args[3], "base64");

// Decrypt the responses
const decrypedResponses = decryptFormSubmission(
  encryptedResponses,
  key,
  iv,
  authTag,
);
console.info(decrypedResponses);
