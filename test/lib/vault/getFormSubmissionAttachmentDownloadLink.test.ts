import { vi, describe, it, expect, beforeEach } from "vitest";
import { logMessage } from "@lib/logging/logger.js";
import { getFormSubmissionAttachmentDownloadLink } from "@lib/vault/getFormSubmissionAttachmentDownloadLink.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

vi.mock("@aws-sdk/s3-request-presigner");
const getSignedUrlMock = vi.mocked(getSignedUrl);

describe("getFormSubmissionAttachmentDownloadLink should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("return the form submission attachment download link if everything goes well", async () => {
    getSignedUrlMock.mockResolvedValueOnce("https://download-link");

    const formSubmissionAttachmentDownloadLink =
      await getFormSubmissionAttachmentDownloadLink(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      );

    expect(formSubmissionAttachmentDownloadLink).toEqual(
      "https://download-link",
    );
  });

  it("throw an error if S3 has an internal failure", async () => {
    const customError = new Error("custom error");
    getSignedUrlMock.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() =>
      getFormSubmissionAttachmentDownloadLink(
        "form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg",
      ),
    ).rejects.toThrowError(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      "[s3] Failed to generate form submission attachment download link. Path: form_attachments/2025-06-09/0c7c3414-05e2-4ae6-a825-683857e4c0c4/image.jpeg.",
    );
  });
});
