export interface PrivateApiKey {
  keyId: string;
  key: string;
  userId: string;
}

export type FormTemplate = Record<string, unknown>;

export interface NewFormSubmission {
  name: string;
}

export interface EncryptedFormSubmission {
  encryptedResponses: string;
  encryptedKey: string;
  encryptedNonce: string;
  encryptedAuthTag: string;
}

export interface FormSubmission {
  confirmationCode: string;
}
