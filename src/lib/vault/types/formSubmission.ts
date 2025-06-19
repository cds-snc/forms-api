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

export type PartialSubmissionAttachment = {
  name: string;
  path: string;
  scanStatus: string;
};

export interface FormSubmission {
  createdAt: number;
  status: FormSubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
  submissionAttachments: PartialSubmissionAttachment[];
}
