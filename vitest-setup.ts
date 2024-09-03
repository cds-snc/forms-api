import { vi } from "vitest";
import { EnvironmentMode } from "./src/config";

vi.doMock("./src/config", async (importOriginal) => {
  const original = (await importOriginal()) as object;
  return {
    ...original,
    AWS_REGION: "ca-central-1",
    ENVIRONMENT_MODE: EnvironmentMode.Local,
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

vi.doMock("node:crypto", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    createPrivateKey: vi.fn(),
  };
});
