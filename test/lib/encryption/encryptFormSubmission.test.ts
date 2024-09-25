import { vi, describe, it, expect, beforeEach } from "vitest";
import { encryptFormSubmission } from "@lib/encryption/encryptFormSubmission.js";
import { FormSubmissionStatus } from "@lib/vault/types/formSubmission.js";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import { logMessage } from "@lib/logging/logger.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as crypto from "node:crypto";

vi.mock("@lib/formsClient/getPublicKey");
const getPublicKeyMock = vi.mocked(getPublicKey);

describe("encryptFormSubmission should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("return an encrypted form response with success", async () => {
    getPublicKeyMock.mockResolvedValueOnce("test");
    vi.spyOn(crypto, "publicEncrypt").mockReturnValue(Buffer.from("test"));

    await expect(
      encryptFormSubmission("254354365464565461", {
        createdAt: 0,
        status: FormSubmissionStatus.New,
        confirmationCode: "",
        answers: "",
        checksum: "",
      }),
    ).resolves.not.toThrow();
  });

  it("throw an error if public key failed to be retrieved", async () => {
    const customError = new Error("custom error");
    getPublicKeyMock.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await expect(() =>
      encryptFormSubmission("254354365464565461", {
        createdAt: 0,
        status: FormSubmissionStatus.New,
        confirmationCode: "",
        answers: "",
        checksum: "",
      }),
    ).rejects.toThrowError("custom error");

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining("[encryption] Failed to encrypt form submission"),
    );
  });
});
