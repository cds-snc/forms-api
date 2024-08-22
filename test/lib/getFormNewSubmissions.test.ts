import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getFormNewSubmissions } from "@lib/vault/getFormNewSubmissions";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("getFormNewSubmissions should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  it("return an undefined new submissions if DynamoDB was not able to find some", async () => {
    dynamoDbMock.on(QueryCommand).resolvesOnce({
      Items: undefined,
    });

    const formNewSubmissions = await getFormNewSubmissions(
      "clzamy5qv0000115huc4bh90m",
    );

    expect(formNewSubmissions).toBeUndefined();
  });

  it("return new submissions if DynamoDB was able to find it", async () => {
    dynamoDbMock.on(QueryCommand).resolvesOnce({
      Items: [
        {
          CreatedAt: 123,
          Name: "ABC",
        },
        {
          CreatedAt: 123,
          Name: "DEF",
        },
      ],
    });

    const formNewSubmissions = await getFormNewSubmissions(
      "clzamy5qv0000115huc4bh90m",
    );

    expect(formNewSubmissions?.length).toBe(2);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    dynamoDbMock.on(QueryCommand).rejectsOnce("custom error");
    const consoleErrorLogSpy = vi.spyOn(console, "error");

    await expect(
      async () => await getFormNewSubmissions("clzamy5qv0000115huc4bh90m"),
    ).rejects.toThrowError("custom error");

    expect(consoleErrorLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[dynamodb] Failed to retrieve new submissions. FormId: clzamy5qv0000115huc4bh90m. Reason:",
      ),
    );
  });
});
