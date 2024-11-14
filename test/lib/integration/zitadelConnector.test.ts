import { vi, describe, it, expect, beforeEach } from "vitest";
import { SignJWT } from "jose";
import axios from "axios";
import {
  introspectAccessToken,
  ZitadelConnectionError,
} from "@lib/integration/zitadelConnector.js";
import { logMessage } from "@lib/logging/logger.js";

vi.spyOn(SignJWT.prototype, "sign").mockResolvedValue("signedJwtToken");

describe("introspectAccessToken should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("call Axios post function with valid payload format", async () => {
    await expect(introspectAccessToken("accessToken")).resolves.not.toThrow();

    expect(axios.post).toHaveBeenCalledWith(
      "http://test/oauth/v2/introspect",
      {
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: "signedJwtToken",
        token: "accessToken",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000,
      },
    );
  });

  it("throw an error if Zitadel post request fails", async () => {
    const connectionError = new ZitadelConnectionError();
    vi.spyOn(axios, "post").mockRejectedValueOnce(connectionError);
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await expect(() =>
      introspectAccessToken("accessToken"),
    ).rejects.toThrowError(ZitadelConnectionError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      connectionError,
      expect.stringContaining("[zitadel] Failed to introspect access token"),
    );
  });
});
