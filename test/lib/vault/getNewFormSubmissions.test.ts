import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { logMessage } from "@lib/logging/logger.js";
import { getNewFormSubmissions } from "@lib/vault/getNewFormSubmissions.js";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
          Version: 8,
        },
        {
          Name: "DEF",
          CreatedAt: 123,
          Version: 8,
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
            Version: 8,
          },
        ],
        LastEvaluatedKey: {
          Name: "ABC",
          CreatedAt: 123,
          Version: 8,
        },
      })
      .resolvesOnce({
        Items: [
          {
            Name: "DEF",
            CreatedAt: 123,
            Version: 8,
          },
          {
            Name: "GHI",
            CreatedAt: 123,
            Version: 8,
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
        version: 8,
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
            Version: 8,
          },
          {
            Name: "DEF",
            CreatedAt: 123,
            Version: 8,
          },
        ],
        LastEvaluatedKey: {
          Name: "DEF",
          CreatedAt: 123,
          Version: 8,
        },
      })
      .resolvesOnce({
        Items: [
          {
            Name: "GHI",
            CreatedAt: 123,
            Version: 8,
          },
          {
            Name: "JKL",
            CreatedAt: 123,
            Version: 8,
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
        version: 8,
      },
      {
        createdAt: 123,
        name: "DEF",
        version: 8,
      },
      {
        createdAt: 123,
        name: "GHI",
        version: 8,
      },
      {
        createdAt: 123,
        name: "JKL",
        version: 8,
      },
    ]);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    const customError = new Error("custom error");
    dynamoDbMock.on(QueryCommand).rejectsOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(
      getNewFormSubmissions("clzamy5qv0000115huc4bh90m", 100),
    ).rejects.toThrow(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[dynamodb] Failed to retrieve new form submissions. FormId: clzamy5qv0000115huc4bh90m",
      ),
    );
  });
});
