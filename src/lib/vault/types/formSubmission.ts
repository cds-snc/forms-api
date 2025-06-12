export interface NewFormSubmission {
  name: string;
  createdAt: number;
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

export type FormSubmissionAttachment = {
  name: string;
  base64EncodedContent: string;
  isPotentiallyMalicious: boolean;
};
