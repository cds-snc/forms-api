import { vi } from "vitest";
import { EnvironmentMode } from "./src/config";

vi.doMock("./src/config", async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    ...original,
    AWS_REGION: "ca-central-1",
    ENVIRONMENT_MODE: EnvironmentMode.Production,
    SERVER_PORT: 3001,
    FRESHDESK_API_URL: "test",
    FRESHDESK_API_KEY: "test",
    LOCALSTACK_ENDPOINT: undefined,
    ZITADEL_DOMAIN: "test",
    ZITADEL_APPLICATION_KEY: JSON.stringify({
      keyId: "test",
      clientId: "test",
      key: "test",
    }),
  };
});

vi.mock("node:crypto", async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    ...original,
    createPrivateKey: vi.fn(),
  };
});
