import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFreshdeskTicket } from "@lib/integration/freshdeskConnector.js";
import axios from "axios";

describe("createFreshdeskTicket should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("call Axios post function with valid payload format", async () => {
    await expect(
      createFreshdeskTicket({
        name: "test",
        email: "test@test.com",
        type: "test",
        subject: "test",
        tags: ["test"],
        description: "test",
        preferredLanguage: "en",
      }),
    ).resolves.not.toThrow();

    expect(axios.post).toHaveBeenCalledWith(
      "https://cds-snc.freshdesk.com/api/v2/tickets",
      {
        name: "test",
        email: "test@test.com",
        type: "test",
        subject: "test",
        tags: ["test"],
        description: "test",
        custom_fields: {
          cf_language: "English",
        },
        source: 2,
        priority: 1,
        status: 2,
        product_id: 61000000642,
        group_id: 61000172262,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic dGVzdDpY",
        },
        timeout: 5000,
      },
    );
  });
});
