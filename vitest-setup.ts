import { vi } from "vitest";

process.env = {
  ...process.env,
  ENVIRONMENT_MODE: "production",
  FRESHDESK_API_KEY: "test",
  REDIS_URL: "test",
  ZITADEL_DOMAIN: "http://test",
  ZITADEL_APPLICATION_KEY: JSON.stringify({
    keyId: "test",
    clientId: "test",
    key: "test",
  }),
};

vi.mock("./src/lib/logging/auditLogs", () => ({
  auditLog: vi.fn(),
}));

vi.mock("./src/lib/integration/databaseConnector", () => ({
  DatabaseConnectorClient: {
    oneOrNone: vi.fn(),
  },
}));

vi.mock("node:crypto", async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    ...original,
    createPublicKey: vi.fn(),
    createPrivateKey: vi.fn(),
    publicEncrypt: vi.fn(),
  };
});

vi.mock("axios", () => {
  return {
    default: {
      post: vi.fn().mockResolvedValue({}),
    },
  };
});
