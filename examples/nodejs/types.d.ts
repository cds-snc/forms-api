export interface PrivateApiKey {
  keyId: string;
  key: string;
  userId: string;
}

export type FormTemplate = Record<string, unknown>;

export interface NewFormSubmission {
  name: string;
  createdAt: number;
}

export interface EncryptedFormSubmission {
  encryptedResponses: string;
  encryptedKey: string;
  encryptedNonce: string;
  encryptedAuthTag: string;
}

export enum FormSubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export interface FormSubmission {
  createdAt: number;
  status: FormSubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
}
