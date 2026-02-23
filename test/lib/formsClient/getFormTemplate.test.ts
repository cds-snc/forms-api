import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { databaseConnector } from "@lib/integration/databaseConnector.js";
import { logMessage } from "@lib/logging/logger.js";

const sqlMock = databaseConnector.executeSqlStatement() as unknown as Mock;

describe("getFormTemplate should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("return an undefined form template if database was not able to find it", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const formTemplate = await getFormTemplate("clzamy5qv0000115huc4bh90m");

    expect(formTemplate).toBeUndefined();
  });

  it("return a form template if database was able to find it", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        jsonConfig: {
          elements: [
            {
              id: 1,
              type: "textField",
            },
          ],
        },
      },
    ]);

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
    sqlMock.mockRejectedValueOnce(customError);
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
