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

// id is marked as optional to ensure backwards compatibility.
// it can be marked as required in the future once we are sure all attachment responses contain id's
export type PartialAttachment = {
  id?: string;
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
