import {
  type PrismaClient,
  type TemplateVersion,
  prisma,
} from "@gcforms/database";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { logMessage } from "@lib/logging/logger.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type DeepMockProxy, mockReset } from "vitest-mock-extended";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("getFormTemplate should", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    vi.clearAllMocks();
  });

  it("return an undefined form template if database was not able to find it", async () => {
    prismaMock.templateVersion.findUnique.mockResolvedValueOnce(null);

    const formTemplate = await getFormTemplate("clzamy5qv0000115huc4bh90m", 1);

    expect(formTemplate).toBeUndefined();
  });

  it("return a form template if database was able to find it", async () => {
    prismaMock.templateVersion.findUnique.mockResolvedValue({
      jsonConfig: {
        elements: [
          {
            id: 1,
            type: "textField",
          },
        ],
      },
    } as unknown as TemplateVersion);

    const formTemplate = await getFormTemplate("clzamy5qv0000115huc4bh90m", 1);

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
    prismaMock.templateVersion.findUnique.mockRejectedValueOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await expect(() =>
      getFormTemplate("clzamy5qv0000115huc4bh90m", 1),
    ).rejects.toThrow(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[formsClient] Failed to retrieve form template. FormId: clzamy5qv0000115huc4bh90m",
      ),
    );
  });
});
