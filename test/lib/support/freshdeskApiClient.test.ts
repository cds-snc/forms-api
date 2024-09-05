import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFreshdeskTicket } from "@src/lib/support/freshdeskApiClient.js";
import axios from "axios";

describe("createFreshdeskTicket should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("call Axios Post function with valid payload format", async () => {
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

    expect(axios).toHaveBeenCalledWith({
      url: "https://cds-snc.freshdesk.com/api/v2/tickets",
      method: "POST",
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic dGVzdDpY",
      },
      data: {
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
    });
  });
});
