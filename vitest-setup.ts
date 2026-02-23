import { vi } from "vitest";
import type { Sql } from "postgres";

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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const mockSql: Sql<any> = vi.fn().mockResolvedValue([]) as unknown as Sql<any>;

class PostgresConnectorMock {
  executeSqlStatement() {
    return mockSql;
  }
}

vi.mock("@gcforms/connectors", async () => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const actual: any = await vi.importActual("@gcforms/connectors");

  return {
    ...actual,
    PostgresConnector: {
      defaultUsingPostgresConnectionUrlFromAwsSecret: vi.fn(
        async () => new PostgresConnectorMock(),
      ),
    },
  };
});

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
