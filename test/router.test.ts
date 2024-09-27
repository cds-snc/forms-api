import { vi, describe, it, expect, beforeEach, beforeAll } from "vitest";
import request from "supertest";
import express, {
  type Response,
  type Request,
  type NextFunction,
} from "express";
import { buildRouter } from "../src/router.js";
import type { ApiOperation } from "@operations/types/operation.js";
import { authenticationMiddleware } from "@middleware/authentication.js";

vi.mock("@middleware/rateLimiter", () => ({
  rateLimiterMiddleware: (_: Request, __: Response, next: NextFunction) =>
    next(),
}));

vi.mock("@middleware/authentication");
const authenticationMiddlewareMock = vi.mocked(authenticationMiddleware);

const apiOperationMock: ApiOperation = vi.hoisted(() => {
  return {
    middleware: [],
    handler: (_: Request, response: Response) => {
      response.sendStatus(200);
    },
  };
});

vi.mock("@operations/retrieveTemplate", () => ({
  retrieveTemplateOperation: apiOperationMock,
}));

vi.mock("@operations/retrieveNewSubmissions", () => ({
  retrieveNewSubmissionsOperation: apiOperationMock,
}));

vi.mock("@operations/retrieveSubmission", () => ({
  retrieveSubmissionOperation: apiOperationMock,
}));

vi.mock("@operations/confirmSubmission", () => ({
  confirmSubmissionOperation: apiOperationMock,
}));

vi.mock("@operations/reportSubmission", () => ({
  reportSubmissionOperation: apiOperationMock,
}));

vi.mock("@operations/checkServiceHealth", () => ({
  checkServiceHealthOperation: apiOperationMock,
}));

enum HttpMethod {
  Get = "Get",
  Post = "Post",
  Put = "Put",
}

enum AuthenticationLevel {
  Authenticated = "Authenticated",
  Unauthenticated = "Unauthenticated",
}

describe("router should", () => {
  const server = express();

  beforeAll(() => {
    server.use("/", buildRouter());
    authenticationMiddlewareMock.mockImplementation(
      // biome-ignore lint/suspicious/useAwait: <explanation>
      async (_: Request, __: Response, nextFunction): Promise<void> => {
        nextFunction();
      },
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("respond with success when path, HTTP request method and authentication level are aligned", () => {
    it.each([
      {
        httpMethod: HttpMethod.Get,
        path: "/forms/cm05mxdua0003moy60gc0cp8n/template",
        authenticationLevel: AuthenticationLevel.Authenticated,
      },
      {
        httpMethod: HttpMethod.Get,
        path: "/forms/cm05mxdua0003moy60gc0cp8n/submission/new",
        authenticationLevel: AuthenticationLevel.Authenticated,
      },
      {
        httpMethod: HttpMethod.Get,
        path: "/forms/cm05mxdua0003moy60gc0cp8n/submission/05-09-5e1a",
        authenticationLevel: AuthenticationLevel.Authenticated,
      },
      {
        httpMethod: HttpMethod.Put,
        path: "/forms/cm05mxdua0003moy60gc0cp8n/submission/05-09-5e1a/confirm/4239462c-cd01-421a-96bf-2c97a552f012",
        authenticationLevel: AuthenticationLevel.Authenticated,
      },
      {
        httpMethod: HttpMethod.Post,
        path: "/forms/cm05mxdua0003moy60gc0cp8n/submission/05-09-5e1a/problem",
        authenticationLevel: AuthenticationLevel.Authenticated,
      },
      {
        httpMethod: HttpMethod.Get,
        path: "/status",
        authenticationLevel: AuthenticationLevel.Unauthenticated,
      },
    ])(
      "respond to %s request on %s when %s",
      async ({ httpMethod, path, authenticationLevel }) => {
        let responseStatus = 0;

        switch (httpMethod) {
          case HttpMethod.Get:
            responseStatus = (await request(server).get(path)).status;
            break;
          case HttpMethod.Post:
            responseStatus = (await request(server).post(path)).status;
            break;
          case HttpMethod.Put:
            responseStatus = (await request(server).put(path)).status;
            break;
        }

        expect(authenticationMiddlewareMock).toHaveBeenCalledTimes(
          authenticationLevel === AuthenticationLevel.Authenticated ? 1 : 0,
        );
        expect(responseStatus).toBe(200);
      },
    );
  });

  describe("respond with error when path parameters are invalid", () => {
    it.each([
      "invalid",
      "clzsn6tao000611j50dexeob",
      "lzsn6tao000611j50dexeob0",
      "alzsn6tao000611j50dexeob0",
    ])(":formId format is not valid (testing %s)", async (formId: string) => {
      const response = await request(server).get(`/forms/${formId}/template`);
      expect(response.status).toBe(404);
    });

    it.each([
      "invalid",
      "010-08-a571",
      "01-08-a51",
      "0-8-a71",
      "ab-01-a571",
      "01-ab-a571",
    ])(
      ":submissionName format is not valid (testing %s)",
      async (submissionName: string) => {
        const response = await request(server).get(
          `/forms/cm05mxdua0003moy60gc0cp8n/submission/${submissionName}`,
        );
        expect(response.status).toBe(404);
      },
    );

    it.each([
      "invalid",
      "42394-cd01-421a-96bf-2c972f012",
      "4239462c-cd-42-96bf-2c97a552f012",
      "4239462c-cd01-421a-2c97a552f012",
      "4239462c-cd01-421a-96bf-2c97a552f01",
      "4239462-cd01-421a-96bf-2c97a552f012",
    ])(
      ":confirmationCode format is not valid (testing %s)",
      async (confirmationCode: string) => {
        const response = await request(server).put(
          `/forms/cm05mxdua0003moy60gc0cp8n/submission/05-09-5e1a/confirm/${confirmationCode}`,
        );
        expect(response.status).toBe(404);
      },
    );
  });
});
