import { vi, describe, it, expect, beforeEach } from "vitest";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { logMessage } from "@lib/logging/logger.js";
import { prisma, type Template, type PrismaClient } from "@gcforms/database";
import { type DeepMockProxy, mockReset } from "vitest-mock-extended";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("getFormTemplate should", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  it("return an undefined form template if database was not able to find it", async () => {
    prismaMock.template.findUnique.mockResolvedValueOnce(null);

    const formTemplate = await getFormTemplate("clzamy5qv0000115huc4bh90m");

    expect(formTemplate).toBeUndefined();
  });

  it("return a form template if database was able to find it", async () => {
    prismaMock.template.findUnique.mockResolvedValue({
      jsonConfig: {
        elements: [
          {
            id: 1,
            type: "textField",
          },
        ],
      },
    } as unknown as Template);

    const formTemplate = await getFormTemplate("clzamy5qv0000115huc4bh90m");

    expect(formTemplate).toEqual({
      jsonConfig: {
        elements: [
          {
            id: 1,
            type: "textField",
          },
        ],
      },
    });
  });

  it("throw an error if database has an internal failure", async () => {
    const customError = new Error("custom error");
    prismaMock.template.findUnique.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await expect(() =>
      getFormTemplate("clzamy5qv0000115huc4bh90m"),
    ).rejects.toThrowError(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[formsClient] Failed to retrieve form template. FormId: clzamy5qv0000115huc4bh90m",
      ),
    );
  });
});
