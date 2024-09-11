import { vi, describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { type Express } from "express";
import { templateApiRoute } from "@routes/forms/formId/template/router.js";
import { getFormTemplate } from "@lib/forms/getFormTemplate.js";
import { logMessage } from "@src/lib/logger.js";

vi.mock("@lib/forms/getFormTemplate");
const getFormTemplateMock = vi.mocked(getFormTemplate);

describe("/forms/:formId/template", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", templateApiRoute);
  });

  describe("Response to GET operation when", () => {
    it("form template does not exist", async () => {
      getFormTemplateMock.mockResolvedValueOnce(undefined);

      const response = await request(server).get("/");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Form template does not exist",
      });
    });

    it("form submission does exist", async () => {
      getFormTemplateMock.mockResolvedValueOnce({
        jsonConfig: {
          elements: [
            {
              id: 1,
              type: "textField",
            },
          ],
        },
      });

      const response = await request(server).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        elements: [
          {
            id: 1,
            type: "textField",
          },
        ],
      });
    });

    it("processing fails due to internal error", async () => {
      getFormTemplateMock.mockRejectedValueOnce(new Error("custom error"));
      const logMessageSpy = vi.spyOn(logMessage, "error");

      const response = await request(server).get("/");

      expect(response.status).toBe(500);
      expect(logMessageSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[route] Internal error while serving request: /forms/undefined/template. Reason:",
        ),
      );
    });
  });
});
