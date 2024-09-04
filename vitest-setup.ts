import { vi } from "vitest";

vi.mock("./src/config", () => {
  return {
    AWS_REGION: "ca-central-1",
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
