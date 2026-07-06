import {
  ZitadelConnectionError,
  introspectAccessToken,
} from "@lib/integration/zitadelConnector.js";
import { logMessage } from "@lib/logging/logger.js";
import got from "got";
import { SignJWT } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.spyOn(SignJWT.prototype, "sign").mockResolvedValue("signedJwtToken");

describe("introspectAccessToken should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("call Got post function with valid payload format", async () => {
    await expect(introspectAccessToken("accessToken")).resolves.not.toThrow();

    expect(got.post).toHaveBeenCalledWith("http://test/oauth/v2/introspect", {
      http2: true,
      timeout: { request: 5000 },
      retry: { limit: 1 },
      headers: {
        Host: "http://test",
      },
      form: {
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: "signedJwtToken",
        token: "accessToken",
      },
    });
  });

  it("throw an error if Zitadel post request fails", async () => {
    const connectionError = new ZitadelConnectionError();

    vi.spyOn(got, "post").mockReturnValueOnce({
      json: vi.fn().mockRejectedValueOnce(connectionError),
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } as any);

    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() => introspectAccessToken("accessToken")).rejects.toThrow(
      ZitadelConnectionError,
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      connectionError,
      expect.stringContaining(
        "[zitadel-connector] Failed to introspect access token",
      ),
    );
  });
});
