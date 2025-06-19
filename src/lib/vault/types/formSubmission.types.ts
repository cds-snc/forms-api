export type NewFormSubmission = {
  name: string;
  createdAt: number;
};

export enum SubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export enum AttachmentScanStatus {
  NoThreatsFound = 0,
  ThreatsFound = 1,
  Unsupported = 2,
  Failed = 3,
}

export type PartialAttachment = {
  name: string;
  path: string;
  scanStatus: AttachmentScanStatus;
};

export type FormSubmission = {
  createdAt: number;
  status: SubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
  attachments: PartialAttachment[];
};
