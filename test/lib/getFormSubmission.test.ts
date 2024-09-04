import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { FormSubmissionStatus } from "@src/lib/vault/dataStructures/formSubmission.js";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("getFormSubmission should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  it("return an undefined form submission if DynamoDB was not able to find it", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: undefined,
    });

    const formSubmission = await getFormSubmission("clzamy5qv0000115huc4bh90m", "01-08-a571");

    expect(formSubmission).toBeUndefined();
  });

  it("return a form submission if DynamoDB was able to find it", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: {
        Status: "New",
      },
    });

    const formSubmission = await getFormSubmission("clzamy5qv0000115huc4bh90m", "01-08-a571");

    expect(formSubmission).toEqual(
      expect.objectContaining({
        status: FormSubmissionStatus.New,
      })
    );
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    dynamoDbMock.on(GetCommand).rejectsOnce("custom error");
    const consoleErrorLogSpy = vi.spyOn(console, "error");

    await expect(() =>
      getFormSubmission("clzamy5qv0000115huc4bh90m", "01-08-a571")
    ).rejects.toThrowError("custom error");

    expect(consoleErrorLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[dynamodb] Failed to retrieve form submission. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571. Reason:"
      )
    );
  });
});
