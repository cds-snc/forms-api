export type NewFormSubmission = {
  name: string;
  createdAt: number;
};

export const SubmissionStatus = {
  new: "New",
  downloaded: "Downloaded",
  confirmed: "Confirmed",
  problem: "Problem",
} as const;

export type SubmissionStatus =
  (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const AttachmentScanStatus = {
  noThreatsFound: "NoThreatsFound",
  threatsFound: "ThreatsFound",
  unsupported: "Unsupported",
  failed: "Failed",
} as const;

export type AttachmentScanStatus =
  (typeof AttachmentScanStatus)[keyof typeof AttachmentScanStatus];

// id is marked as optional to ensure backwards compatibility.
// it can be marked as required in the future once we are sure all attachment responses contain id's
export type PartialAttachment = {
  id: string;
  name: string;
  path: string;
  scanStatus: AttachmentScanStatus;
  md5?: string;
};

export type FormSubmission = {
  createdAt: number;
  status: SubmissionStatus;
  confirmationCode: string;
  answers: string;
  checksum: string;
  attachments: PartialAttachment[];
};
