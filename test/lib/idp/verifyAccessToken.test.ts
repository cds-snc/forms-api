import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyAccessToken } from "@lib/idp/verifyAccessToken.js";
import { introspectAccessToken } from "@lib/integration/zitadelConnector.js";
import { getValueFromCache, cacheValue } from "@lib/utils/cache.js";
import { logMessage } from "@lib/logging/logger.js";

vi.mock("@lib/utils/cache");
const getValueFromCacheMock = vi.mocked(getValueFromCache);
const cacheValueMock = vi.mocked(cacheValue);

vi.mock("@lib/integration/zitadelConnector");
const introspectAccessTokenMock = vi.mocked(introspectAccessToken);

describe("verifyAccessToken should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("properly leverage caching when returning verified access token", () => {
    it("when it does exist in cache", async () => {
      getValueFromCacheMock.mockResolvedValueOnce(
        JSON.stringify({
          expirationEpochTime: 1000,
          serviceAccountId: "11111111111",
          serviceUserId: "clzsn6tao000611j50dexeob0",
        }),
      );

      const verifiedAccessToken = await verifyAccessToken(
        "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
      );

      expect(verifiedAccessToken).toEqual({
        expirationEpochTime: 1000,
        serviceAccountId: "11111111111",
        serviceUserId: "clzsn6tao000611j50dexeob0",
      });
    });

    it("when it does not exist in cache", async () => {
      getValueFromCacheMock.mockResolvedValueOnce(undefined);
      introspectAccessTokenMock.mockResolvedValueOnce({
        active: true,
        exp: 10,
        sub: "sub",
        username: "username",
      });

      const verifiedAccessToken = await verifyAccessToken(
        "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
      );

      expect(verifiedAccessToken).toEqual({
        expirationEpochTime: 10,
        serviceAccountId: "sub",
        serviceUserId: "username",
      });
      expect(cacheValueMock).toHaveBeenCalledWith(
        "api:auth:4Wqjx84ka16rQpVZ16lnZdKVXScKTRsvfKm6lSqHGgs=",
        '{"expirationEpochTime":10,"serviceAccountId":"sub","serviceUserId":"username"}',
        300,
      );
    });
  });

  describe("handle access token introspection result", () => {
    it("when token is not active", async () => {
      getValueFromCacheMock.mockResolvedValueOnce(undefined);
      introspectAccessTokenMock.mockResolvedValueOnce({
        active: false,
      });

      const verifiedAccessToken = await verifyAccessToken(
        "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
      );

      expect(verifiedAccessToken).toBeUndefined();
    });

    it("when token is active but missing additional properties", async () => {
      getValueFromCacheMock.mockResolvedValueOnce(undefined);
      introspectAccessTokenMock.mockResolvedValueOnce({
        active: true,
      });

      await expect(() =>
        verifyAccessToken("RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs="),
      ).rejects.toThrowError(
        "Access token introspection result is missing required properties",
      );
    });

    it("throw an error if access token introspection has an internal failure", async () => {
      getValueFromCacheMock.mockResolvedValueOnce(undefined);
      const customError = new Error("custom error");
      introspectAccessTokenMock.mockRejectedValueOnce(customError);
      const logMessageSpy = vi.spyOn(logMessage, "error");

      await expect(() =>
        verifyAccessToken("RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs="),
      ).rejects.toThrowError("custom error");

      expect(logMessageSpy).toHaveBeenCalledWith(
        customError,
        expect.stringContaining("[idp] Failed to verify access token"),
      );
    });
  });
});
