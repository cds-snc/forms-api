import { vi } from "vitest";

vi.mock("./src/config", async () => ({
  AWS_REGION: "ca-central-1",
  SERVER_PORT: 3001,
  LOCALSTACK_ENDPOINT: undefined,
  REDIS_URL: "redis",
  ZITADEL_APPLICATION_KEY: JSON.stringify({
    keyId: "test",
    clientId: "test",
    key: "test",
  }),
  ZITADEL_DOMAIN: "test",
}));

vi.mock("node:crypto", async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    createPrivateKey: vi.fn(),
  };
});
