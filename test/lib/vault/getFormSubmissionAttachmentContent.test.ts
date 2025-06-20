import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { logMessage } from "@lib/logging/logger.js";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getFormSubmissionAttachmentContent } from "@lib/vault/getFormSubmissionAttachmentContent.js";
import { sdkStreamMixin } from "@smithy/util-stream";
import { Readable } from "node:stream";

const s3ClientMock = mockClient(S3Client);

describe("getFormSubmissionAttachmentContent should", () => {
  beforeEach(() => {
    s3ClientMock.reset();
  });

  it("return the content of a form submission attachment if it exist in S3", async () => {
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

    const formSubmissionAttachment = await getFormSubmissionAttachmentContent(
      "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
    );

    expect(formSubmissionAttachment.base64EncodedContent).toEqual(
      "SGVsbG8gV29ybGQ=",
    );
  });

  it("throw an error if attachment does not exist", async () => {
    s3ClientMock.on(GetObjectCommand).resolvesOnce({
      Body: undefined,
    });

    await expect(
      getFormSubmissionAttachmentContent(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      ),
    ).rejects.toThrow(new Error("Attachment could not be found"));
  });

  it("throw an error if S3 has an internal failure", async () => {
    const customError = new Error("custom error");
    s3ClientMock.on(GetObjectCommand).rejectsOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() =>
      getFormSubmissionAttachmentContent(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      ),
    ).rejects.toThrowError(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      "[s3] Failed to retrieve form submission attachment content. Path: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
    );
  });
});
