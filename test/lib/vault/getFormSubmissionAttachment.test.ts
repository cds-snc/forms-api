import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { logMessage } from "@lib/logging/logger.js";
import {
  GetObjectCommand,
  GetObjectTaggingCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getFormSubmissionAttachment } from "@lib/vault/getFormSubmissionAttachment.js";
import { sdkStreamMixin } from "@smithy/util-stream";
import { Readable } from "node:stream";

const s3ClientMock = mockClient(S3Client);

describe("getFormSubmissionAttachment should", () => {
  beforeEach(() => {
    s3ClientMock.reset();
  });

  it("return a form submission attachment if it exist in S3", async () => {
    s3ClientMock.on(GetObjectCommand).resolvesOnce({
      Body: sdkStreamMixin(
        new Readable({
          read() {
            this.push("Hello World");
            this.push(null);
          },
        }),
      ),
    });

    s3ClientMock.on(GetObjectTaggingCommand).resolvesOnce({
      TagSet: [
        { Key: "GuardDutyMalwareScanStatus", Value: "NO_THREATS_FOUND" },
      ],
    });

    const formSubmissionAttachment = await getFormSubmissionAttachment(
      "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
    );

    expect(formSubmissionAttachment).toEqual({
      name: "image.jpeg",
      base64EncodedContent: "SGVsbG8gV29ybGQ=",
      isPotentiallyMalicious: false,
    });
  });

  it.each([
    {
      malwareScanStatus: "NO_THREATS_FOUND",
      isDetectedAsMalicious: false,
    },
    {
      malwareScanStatus: "THREATS_FOUND",
      isDetectedAsMalicious: true,
    },
    {
      malwareScanStatus: "UNSUPPORTED",
      isDetectedAsMalicious: true,
    },
    {
      malwareScanStatus: "FAILED",
      isDetectedAsMalicious: true,
    },
  ])(
    "return a form submission attachment with proper maliciousness detection (malwareScanStatus: %s / isDetectedAsMalicious: %s)",
    async ({ malwareScanStatus, isDetectedAsMalicious }) => {
      s3ClientMock.on(GetObjectCommand).resolvesOnce({
        Body: sdkStreamMixin(
          new Readable({
            read() {
              this.push("Hello World");
              this.push(null);
            },
          }),
        ),
      });

      s3ClientMock.on(GetObjectTaggingCommand).resolvesOnce({
        TagSet: [
          { Key: "GuardDutyMalwareScanStatus", Value: malwareScanStatus },
        ],
      });

      const formSubmissionAttachment = await getFormSubmissionAttachment(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      );

      expect(formSubmissionAttachment).toEqual(
        expect.objectContaining({
          isPotentiallyMalicious: isDetectedAsMalicious,
        }),
      );
    },
  );

  it("throw an error if attachment does not exist", async () => {
    s3ClientMock.on(GetObjectCommand).resolvesOnce({
      Body: undefined,
    });

    await expect(
      getFormSubmissionAttachment(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      ),
    ).rejects.toThrow(
      new Error(
        "Attachment could not be found. Path: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
      ),
    );
  });

  it("throw an error if attachment exist but no valid associated tags have been found", async () => {
    s3ClientMock.on(GetObjectCommand).resolvesOnce({
      Body: sdkStreamMixin(
        new Readable({
          read() {
            this.push("Hello World");
            this.push(null);
          },
        }),
      ),
    });

    s3ClientMock.on(GetObjectTaggingCommand).resolvesOnce({
      TagSet: [{ Key: "something", Value: "test" }],
    });

    await expect(
      getFormSubmissionAttachment(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      ),
    ).rejects.toThrow(
      new Error("Malware scan tag can't be exploited. Tag: undefined."),
    );
  });

  it("throw an error if S3 has an internal failure when getting object", async () => {
    s3ClientMock.on(GetObjectCommand).rejectsOnce(new Error("custom error"));
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() =>
      getFormSubmissionAttachment(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      ),
    ).rejects.toThrowError(
      "Failed to retrieve attachment with key: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      new Error(
        "Failed to retrieve attachment with key: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
      ),
      "[s3] Failed to retrieve form submission attachment. Path: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
    );
  });

  it("throw an error if S3 has an internal failure when getting object tags", async () => {
    s3ClientMock.on(GetObjectCommand).resolvesOnce({
      Body: sdkStreamMixin(
        new Readable({
          read() {
            this.push("Hello World");
            this.push(null);
          },
        }),
      ),
    });
    s3ClientMock
      .on(GetObjectTaggingCommand)
      .rejectsOnce(new Error("custom error"));
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() =>
      getFormSubmissionAttachment(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      ),
    ).rejects.toThrowError(
      "Failed to retrieve attachment tags with key: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      new Error(
        "Failed to retrieve attachment tags with key: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
      ),
      "[s3] Failed to retrieve form submission attachment. Path: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
    );
  });
});
