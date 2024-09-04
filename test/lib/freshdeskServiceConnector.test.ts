import { describe, it, expect, beforeEach, vi } from "vitest";
import { FreshdeskApiClient } from "@lib/freshdeskServiceConnector";
import { EnvironmentMode } from "@src/config";

const axiosPostMock = vi.fn();

vi.mock("axios", async (importOriginal) => {
  const original = (await importOriginal()) as object;

  return {
    default: {
      ...original,
      create: () => ({
        post: axiosPostMock,
      }),
    },
  };
});

describe("FreshdeskApiClient should", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("call Axios Post function with valid payload format", async () => {
    axiosPostMock.mockReturnValueOnce(Promise.resolve());

    const freshdeskApiClient = new FreshdeskApiClient(
      "http://localhost/api",
      "test",
      1000,
    );

    await expect(
      freshdeskApiClient.createTicket(
        {
          name: "test",
          email: "test@test.com",
          type: "test",
          subject: "test",
          tags: ["test"],
          description: "test",
          preferredLanguage: "en",
        },
        EnvironmentMode.Production,
      ),
    ).resolves.not.toThrow();

    expect(axiosPostMock).toHaveBeenCalledWith("/v2/tickets", {
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
    });
  });
});
