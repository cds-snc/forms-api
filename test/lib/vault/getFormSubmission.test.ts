import { vi, describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getFormSubmission } from "@lib/vault/getFormSubmission.js";
import { SubmissionStatus } from "@lib/vault/types/formSubmission.types.js";
import { logMessage } from "@lib/logging/logger.js";
import { buildMockedVaultItem } from "test/mocks/dynamodb.js";
import { FormSubmissionNotFoundException } from "@lib/vault/types/exceptions.types.js";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("getFormSubmission should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  it("return a form submission if DynamoDB was able to find it", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: buildMockedVaultItem("New"),
    });

    const formSubmission = await getFormSubmission(
      "clzamy5qv0000115huc4bh90m",
      "01-08-a571",
    );

    expect(formSubmission).toEqual(
      expect.objectContaining({
        status: SubmissionStatus.New,
      }),
    );
  });

  it("fail to get form submission if it does not exist", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: undefined,
    });

    await expect(
      getFormSubmission("clzamy5qv0000115huc4bh90m", "01-08-a571"),
    ).rejects.toThrow(FormSubmissionNotFoundException);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    const customError = new Error("custom error");
    dynamoDbMock.on(GetCommand).rejectsOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() =>
      getFormSubmission("clzamy5qv0000115huc4bh90m", "01-08-a571"),
    ).rejects.toThrowError(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[dynamodb] Failed to retrieve form submission. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571",
      ),
    );
  });
});
