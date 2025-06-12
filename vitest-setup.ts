import { vi } from "vitest";

process.env = {
  ...process.env,
  ENVIRONMENT_MODE: "production",
  FRESHDESK_API_KEY: "test",
  REDIS_URL: "test",
  VAULT_FILE_STORAGE_BUCKET_NAME: "bucket",
  ZITADEL_TRUSTED_DOMAIN: "http://test",
  ZITADEL_URL: "http://test",
  ZITADEL_APPLICATION_KEY: JSON.stringify({
    keyId: "test",
    clientId: "test",
    key: "test",
  }),
};

vi.mock("./src/lib/integration/databaseConnector", () => ({
  DatabaseConnectorClient: {
    oneOrNone: vi.fn(),
  },
}));

vi.mock("./src/lib/logging/auditLogs", () => ({
  auditLog: vi.fn(),
}));

vi.mock("got", () => ({
  default: {
    post: vi.fn().mockReturnValue({
      json: vi.fn().mockResolvedValue({}),
    }),
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

vi.mock("redis", () => {
  const client = {
    connect: vi.fn().mockResolvedValue({}),
    quit: vi.fn(),
    on: vi.fn().mockReturnThis(),
  };
  return {
    createClient: vi.fn(() => client),
  };
});
