import { vi, describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, {
  type Express,
  type NextFunction,
  type Response,
  type Request,
  Router,
} from "express";
import { formsApiRoute } from "@routes/forms/router.js";

vi.mock("@middleware/authentication/middleware", () => ({
  authenticationMiddleware: (
    _req: Request,
    _res: Response,
    next: NextFunction,
  ) => next(),
}));

vi.mock("@middleware/rateLimiter/middleware", () => ({
  rateLimiterMiddleware: (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

vi.mock("@middleware/rateLimiter/middleware", () => ({
  rateLimiterMiddleware: (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

vi.mock("@routes/forms/submission/router", () => ({
  submissionApiRoute: Router().get("/", (_, response: Response) => {
    return response.sendStatus(200);
  }),
}));

describe("/forms/:formId/submission", () => {
  let server: Express;

  beforeAll(() => {
    server = express();
    server.use("/", formsApiRoute);
  });

  describe("Response to GET operation when", () => {
    it("formId format is valid", async () => {
      const response = await request(server).get(
        "/clzsn6tao000611j50dexeob0/submission",
      );
      expect(response.status).toBe(200);
    });

    it.each([
      "invalid",
      "clzsn6tao000611j50dexeob",
      "lzsn6tao000611j50dexeob0",
      "alzsn6tao000611j50dexeob0",
    ])("formId format is not valid (testing %s)", async (formId: string) => {
      const response = await request(server).get(`/${formId}/submission`);
      expect(response.status).toBe(404);
    });
  });
});
