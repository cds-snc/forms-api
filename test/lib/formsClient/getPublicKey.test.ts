import { vi, describe, it, expect, beforeEach } from "vitest";
import { getPublicKey } from "@lib/formsClient/getPublicKey.js";
import {
  getValueFromRedis,
  setValueInRedis,
} from "@lib/integration/redis/redisClientAdapter.js";
import { logMessage } from "@lib/logging/logger.js";
import {
  type ApiServiceAccount,
  prisma,
  type PrismaClient,
} from "@gcforms/database";
import { type DeepMockProxy, mockReset } from "vitest-mock-extended";

vi.mock("@lib/integration/redis/redisClientAdapter");
const getValueFromRedisMock = vi.mocked(getValueFromRedis);
const setValueInRedisMock = vi.mocked(setValueInRedis);

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("getPublicKey should", () => {
  beforeEach(() => {
    mockReset(prismaMock);
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
      prismaMock.apiServiceAccount.findUnique.mockResolvedValue({
        publicKey: "RkS8hzu0MtwL+Qs2lK7KX9CLK7v6lxYpqs7ns5MwuOs=",
      } as unknown as ApiServiceAccount);

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
    prismaMock.apiServiceAccount.findUnique.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() => getPublicKey("254354365464565461")).rejects.toThrowError(
      customError,
    );

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[formsClient] Failed to retrieve public key. ServiceAccountId: 254354365464565461",
      ),
    );
  });
});
