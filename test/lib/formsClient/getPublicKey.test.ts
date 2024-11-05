import { vi, describe, it, expect, beforeEach } from "vitest";
import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import {
  getValueFromRedis,
  setValueInRedis,
} from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";

vi.mock("@lib/integration/redis/redisClientAdapter");
const getValueFromRedisMock = vi.mocked(getValueFromRedis);
const setValueInRedisMock = vi.mocked(setValueInRedis);

describe("getPublicKey should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("return a public key if there is one associated to the service account id", () => {
    it("when it does exist in cache", async () => {
      getValueFromRedisMock.mockResolvedValueOnce(
        "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
      );

      const publicKey = await getPublicKey("254354365464565461");

      expect(publicKey).toEqual("RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=");
    });

    it("when it does not exist in cache", async () => {
      vi.spyOn(DatabaseConnectorClient, "oneOrNone").mockResolvedValueOnce({
        publicKey: "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
      });

      const publicKey = await getPublicKey("254354365464565461");

      expect(publicKey).toEqual("RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=");
      expect(setValueInRedisMock).toHaveBeenCalledWith(
        "api:publicKey:254354365464565461",
        "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
        300,
      );
    });
  });

  it("throw an error if database has an internal failure", async () => {
    const customError = new Error("custom error");
    vi.spyOn(DatabaseConnectorClient, "oneOrNone").mockRejectedValueOnce(
      customError,
    );
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await expect(() => getPublicKey("254354365464565461")).rejects.toThrowError(
      "custom error",
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[formsClient] Failed to retrieve public key. ServiceAccountId: 254354365464565461",
      ),
    );
  });
});
