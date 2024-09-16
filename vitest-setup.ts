import { vi } from "vitest";

process.env = {
  ...process.env,
  ENVIRONMENT_MODE: "production",
  FRESHDESK_API_KEY: "test",
  REDIS_URL: "test",
  ZITADEL_DOMAIN: "test",
  ZITADEL_APPLICATION_KEY: JSON.stringify({
    keyId: "test",
    clientId: "test",
    key: "test",
  }),
};

vi.mock("axios");
vi.mock("./src/lib/auditLogs",()=>({
  logEvent: vi.fn()
}));

vi.mock("./src/lib/connectors/databaseConnector", () => ({
  DatabaseConnectorClient: {
    oneOrNone: vi.fn(),
  },
}));

vi.mock("node:crypto", async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    ...original,
    createPrivateKey: vi.fn(),
  };
});
