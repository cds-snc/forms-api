import { vi, describe, it, expect, beforeEach } from "vitest";
import { getFormTemplate } from "@lib/formsClient/getFormTemplate.js";
import { DatabaseConnectorClient } from "@lib/integration/databaseConnector.js";
import { logMessage } from "@lib/logging/logger.js";

describe("getFormTemplate should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("return an undefined form template if database was not able to find it", async () => {
    vi.spyOn(DatabaseConnectorClient, "oneOrNone").mockResolvedValueOnce(null);

    const formTemplate = await getFormTemplate("clzamy5qv0000115huc4bh90m");

    expect(formTemplate).toBeUndefined();
  });

  it("return a form template if database was able to find it", async () => {
    vi.spyOn(DatabaseConnectorClient, "oneOrNone").mockResolvedValueOnce({
      jsonConfig: {
        elements: [
          {
            id: 1,
            type: "textField",
          },
        ],
      },
    });

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
    vi.spyOn(DatabaseConnectorClient, "oneOrNone").mockRejectedValueOnce(
      new Error("custom error"),
    );
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await expect(() =>
      getFormTemplate("clzamy5qv0000115huc4bh90m"),
    ).rejects.toThrowError("custom error");

    expect(logMessageSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[database] Failed to retrieve form template. FormId: clzamy5qv0000115huc4bh90m. Reason:",
      ),
    );
  });
});
