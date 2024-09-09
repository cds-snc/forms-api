import { vi, describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { Router, type Express, type Response } from "express";
import { submissionApiRoute } from "@routes/forms/submission/router.js";

vi.mock("@routes/forms/submission/new/router", () => ({
  newApiRoute: Router().get("/", (_, response: Response) => {
    return response.sendStatus(200);
  }),
}));

vi.mock("@routes/forms/submission/submissionName/router", () => ({
  submissionNameApiRoute: Router().get("/", (_, response: Response) => {
    return response.sendStatus(200);
  }),
}));

describe("/forms/:formId/submission", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", submissionApiRoute);
  });

  describe("/new", () => {
    it("Response to GET operation", async () => {
      const response = await request(server).get("/new");
      expect(response.status).toBe(200);
    });
  });

  describe("/:submissionName", () => {
    describe("Response to GET operation when", () => {
      it("submissionName format is valid", async () => {
        const response = await request(server).get("/01-08-a571");
        expect(response.status).toBe(200);
      });

      it.each([
        "invalid",
        "010-08-a571",
        "01-08-a51",
        "0-8-a71",
        "ab-01-a571",
        "01-ab-a571",
      ])(
        "submissionName format is not valid (testing %s)",
        async (submissionName: string) => {
          const response = await request(server).get(`/${submissionName}`);
          expect(response.status).toBe(404);
        },
      );
    });
  });
});
