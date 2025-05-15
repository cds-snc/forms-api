import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  verifyAccessToken,
  AccessTokenInvalidError,
  AccessTokenExpiredError,
  AccessControlError,
  AccessTokenMalformedError,
} from "@lib/idp/verifyAccessToken.js";
import {
  introspectAccessToken,
  ZitadelConnectionError,
} from "@lib/integration/zitadelConnector.js";
import {
  getValueFromRedis,
  setValueInRedis,
} from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";
import { auditLog } from "@lib/logging/auditLogs.js";

vi.mock("@lib/integration/redis/redisClientAdapter");
const getValueFromRedisMock = vi.mocked(getValueFromRedis);
const setValueInRedisMock = vi.mocked(setValueInRedis);

vi.mock("@lib/integration/zitadelConnector");
const introspectAccessTokenMock = vi.mocked(introspectAccessToken);

vi.mock("@lib/logging/auditLogs");
const auditLogSpy = vi.mocked(auditLog);

/**
 * Returns current epoch time or advanced time
 * @param minutes Minutes to Advance Epoch Time
 * @returns Epoch Time
 */
const createEpochTime = (minutes = 0) => {
  if (minutes === 0) {
    return Date.now() / 1000;
  }

  return Date.now() + (minutes * 60) / 1000;
};

describe("verifyAccessToken should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("properly leverage caching when returning verified access token", () => {
    it("when it does exist in cache", async () => {
      const expirationEpochTime = createEpochTime(5);
      getValueFromRedisMock.mockResolvedValueOnce(
        JSON.stringify({
          expirationEpochTime: expirationEpochTime,
          serviceAccountId: "11111111111",
          serviceUserId: "clzsn6tao000611j50dexeob0",
        }),
      );

      const verifiedAccessToken = await verifyAccessToken(
        "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
        "clzsn6tao000611j50dexeob0",
      );

      expect(verifiedAccessToken).toEqual({
        expirationEpochTime: expirationEpochTime,
        serviceAccountId: "11111111111",
        serviceUserId: "clzsn6tao000611j50dexeob0",
      });
    });

    it("when it does not exist in cache", async () => {
      const expirationEpochTime = createEpochTime(5);
      getValueFromRedisMock.mockResolvedValueOnce(undefined);
      introspectAccessTokenMock.mockResolvedValueOnce({
        active: true,
        exp: expirationEpochTime,
        sub: "sub",
        username: "username",
      });

      const verifiedAccessToken = await verifyAccessToken(
        "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
        "username",
      );

      expect(verifiedAccessToken).toEqual({
        expirationEpochTime: expirationEpochTime,
        serviceAccountId: "sub",
        serviceUserId: "username",
      });

      expect(setValueInRedisMock).toHaveBeenCalledWith(
        "api:auth:4Wqjx84ka16rQpVZ16lnZdKVXScKTRsvfKm6lSqHGgs=",
        `{"expirationEpochTime":${expirationEpochTime},"serviceAccountId":"sub","serviceUserId":"username"}`,
        300,
      );
    });
  });

  describe("handle access token introspection result", () => {
    it("when token is not active", async () => {
      getValueFromRedisMock.mockResolvedValueOnce(undefined);
      introspectAccessTokenMock.mockResolvedValueOnce({
        active: false,
      });

      await expect(
        verifyAccessToken(
          "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
          "0000",
        ),
      ).rejects.toThrow(AccessTokenInvalidError);

      expect(auditLogSpy).toHaveBeenCalledWith(
        "0000",
        {
          id: "unknown",
          type: "ServiceAccount",
        },
        "InvalidAccessToken",
        "Access token was marked as invalid by IDP",
      );
    });

    it("when token is active but missing additional properties", async () => {
      getValueFromRedisMock.mockResolvedValueOnce(undefined);
      introspectAccessTokenMock.mockResolvedValueOnce({
        active: true,
      });

      await expect(() =>
        verifyAccessToken(
          "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
          "0000",
        ),
      ).rejects.toThrow(AccessTokenMalformedError);
    });

    it("when token is expired", async () => {
      getValueFromRedisMock.mockResolvedValueOnce(
        JSON.stringify({
          expirationEpochTime: createEpochTime() - 5,
          serviceAccountId: "11111111111",
          serviceUserId: "0000",
        }),
      );

      await expect(() =>
        verifyAccessToken(
          "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
          "0000",
        ),
      ).rejects.toThrow(AccessTokenExpiredError);

      expect(auditLogSpy).toHaveBeenCalledWith(
        "0000",
        {
          id: "11111111111",
          type: "ServiceAccount",
        },
        "InvalidAccessToken",
        "Access token has expired",
      );
    });

    it("when token does not match the formId", async () => {
      getValueFromRedisMock.mockResolvedValueOnce(
        JSON.stringify({
          expirationEpochTime: createEpochTime(5),
          serviceAccountId: "11111111111",
          serviceUserId: "1111",
        }),
      );

      await expect(() =>
        verifyAccessToken(
          "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
          "0000",
        ),
      ).rejects.toThrow(AccessControlError);

      expect(auditLogSpy).toHaveBeenCalledWith(
        "1111",
        {
          id: "0000",
          type: "Form",
        },
        "AccessDenied",
        "User 11111111111 does not have access to form 0000",
      );
    });

    it("throw an error if access token introspection has an internal failure", async () => {
      getValueFromRedisMock.mockResolvedValueOnce(undefined);
      const connectionError = new ZitadelConnectionError();
      introspectAccessTokenMock.mockRejectedValueOnce(connectionError);
      const logMessageSpy = vi.spyOn(logMessage, "info");

      await expect(() =>
        verifyAccessToken(
          "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
          "0000",
        ),
      ).rejects.toThrowError(ZitadelConnectionError);

      expect(logMessageSpy).toHaveBeenCalledWith(
        connectionError,
        expect.stringContaining("[idp] Failed to verify access token"),
      );
    });
  });
});
