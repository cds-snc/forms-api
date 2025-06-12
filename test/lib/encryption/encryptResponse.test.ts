import { vi, describe, it, expect, beforeEach } from "vitest";
import { encryptResponse } from "@lib/encryption/encryptResponse.js";
import { logMessage } from "@lib/logging/logger.js";
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as crypto from "node:crypto";

describe("encryptFormSubmission should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("return an encrypted response with success", () => {
    vi.spyOn(crypto, "publicEncrypt").mockReturnValue(Buffer.from("test"));

    const encryptedResponse = encryptResponse(
      "serviceAccountPublicKey",
      "payload",
    );

    expect(encryptedResponse).toEqual({
      encryptedKey: "dGVzdA==",
      encryptedNonce: "dGVzdA==",
      encryptedAuthTag: "dGVzdA==",
      encryptedResponses: expect.any(String),
    });
  });

  it("throw an error if encryption fails", () => {
    const customError = new Error("custom error");
    vi.spyOn(crypto, "publicEncrypt").mockImplementationOnce(() => {
      throw customError;
    });
    const logMessageSpy = vi.spyOn(logMessage, "error");

    expect(() =>
      encryptResponse("serviceAccountPublicKey", "payload"),
    ).toThrowError("custom error");

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining("[encryption] Failed to encrypt response"),
    );
  });
});
