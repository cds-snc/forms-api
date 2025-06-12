export type PrivateApiKey = {
  keyId: string;
  key: string;
  userId: string;
  formId: string;
};

export type NewFormSubmission = {
  name: string;
  createdAt: number;
};

export type EncryptedFormSubmission = {
  encryptedKey: string;
  encryptedNonce: string;
  encryptedAuthTag: string;
  encryptedResponses: string;
};

export enum FormSubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export type Attachment = {
  name: string;
  base64EncodedContent: string;
  isPotentiallyMalicious: boolean;
};

export type FormSubmission = {
  createdAt: number;
  status: FormSubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
  attachments?: Attachment[];
};

export type FormSubmissionProblem = {
  contactEmail: string;
  description: string;
  preferredLanguage: string;
};
