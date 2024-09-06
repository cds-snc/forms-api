import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("getNewFormSubmissions should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  it("return an empty array of new form submissions if DynamoDB was not able to find any", async () => {
    dynamoDbMock.on(QueryCommand).resolvesOnce({
      Items: undefined,
    });

    const newFormSubmissions = await getNewFormSubmissions(
      "clzamy5qv0000115huc4bh90m",
      100,
    );

    expect(newFormSubmissions).toEqual([]);
  });

  it("return an array of new form submissions if DynamoDB was able to find one or more", async () => {
    dynamoDbMock.on(QueryCommand).resolvesOnce({
      Items: [
        {
          Name: "ABC",
          CreatedAt: 123,
        },
        {
          Name: "DEF",
          CreatedAt: 123,
        },
      ],
    });

    const newFormSubmissions = await getNewFormSubmissions(
      "clzamy5qv0000115huc4bh90m",
      100,
    );

    expect(newFormSubmissions.length).toBe(2);
  });

  it("return an array of limited new form submissions if DynamoDB was able to find more than the maximum requested number", async () => {
    dynamoDbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [
          {
            Name: "ABC",
            CreatedAt: 123,
          },
        ],
        LastEvaluatedKey: {
          Name: "ABC",
          CreatedAt: 123,
        },
      })
      .resolvesOnce({
        Items: [
          {
            Name: "DEF",
            CreatedAt: 123,
          },
          {
            Name: "GHI",
            CreatedAt: 123,
          },
        ],
      });

    const newFormSubmissions = await getNewFormSubmissions(
      "clzamy5qv0000115huc4bh90m",
      1,
    );

    expect(newFormSubmissions).toEqual([
      {
        createdAt: 123,
        name: "ABC",
      },
    ]);
  });

  it("return an array of new form submissions even if DynamoDB has to paginates the results", async () => {
    dynamoDbMock
      .on(QueryCommand)
      .resolvesOnce({
        Items: [
          {
            Name: "ABC",
            CreatedAt: 123,
          },
          {
            Name: "DEF",
            CreatedAt: 123,
          },
        ],
        LastEvaluatedKey: {
          Name: "DEF",
          CreatedAt: 123,
        },
      })
      .resolvesOnce({
        Items: [
          {
            Name: "GHI",
            CreatedAt: 123,
          },
          {
            Name: "JKL",
            CreatedAt: 123,
          },
        ],
      });

    const newFormSubmissions = await getNewFormSubmissions(
      "clzamy5qv0000115huc4bh90m",
      100,
    );

    expect(newFormSubmissions).toEqual([
      {
        createdAt: 123,
        name: "ABC",
      },
      {
        createdAt: 123,
        name: "DEF",
      },
      {
        createdAt: 123,
        name: "GHI",
      },
      {
        createdAt: 123,
        name: "JKL",
      },
    ]);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    dynamoDbMock.on(QueryCommand).rejectsOnce("custom error");
    const consoleErrorLogSpy = vi.spyOn(console, "error");

    await expect(
      getNewFormSubmissions("clzamy5qv0000115huc4bh90m", 100),
    ).rejects.toThrowError("custom error");

    expect(consoleErrorLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[dynamodb] Failed to retrieve new form submissions. FormId: clzamy5qv0000115huc4bh90m. Reason:",
      ),
    );
  });
});