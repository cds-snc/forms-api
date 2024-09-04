import { vi } from "vitest";

process.env = {
  ...process.env,
  ENVIRONMENT_MODE: "production",
  FRESHDESK_API_KEY: "test",
  ZITADEL_DOMAIN: "test",
  ZITADEL_APPLICATION_KEY: JSON.stringify({
    keyId: "test",
    clientId: "test",
    key: "test",
  }),
};

vi.mock("axios");

vi.mock("node:crypto", async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    ...original,
    createPrivateKey: vi.fn(),
  };
});
