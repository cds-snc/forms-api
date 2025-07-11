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
  NoThreatsFound = "NoThreatsFound",
  ThreatsFound = "ThreatsFound",
  Unsupported = "Unsupported",
  Failed = "Failed",
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
