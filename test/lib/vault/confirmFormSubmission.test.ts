import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { confirmFormSubmission } from "@lib/vault/confirmFormSubmission.js";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionIncorrectConfirmationCodeException,
  FormSubmissionNotFoundException,
} from "@lib/vault/types/exceptions.types.js";
import { logMessage } from "@lib/logging/logger.js";
import { buildMockedVaultItem } from "test/mocks/dynamodb.js";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("confirmFormSubmission should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("successfully confirm a form submission if everything goes well", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1519129853500));

    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: buildMockedVaultItem("New", "620b203c-9836-4000-bf30-1c3bcc26b834"),
    });
    dynamoDbMock.on(UpdateCommand).resolvesOnce({});

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).resolves.not.toThrow();

    expect(dynamoDbMock.commandCalls(UpdateCommand).length).toEqual(1);
    expect(dynamoDbMock.commandCalls(UpdateCommand)[0].args[0].input).toEqual({
      ExpressionAttributeNames: {
        "#statusCreatedAtKey": "Status#CreatedAt",
      },
      ExpressionAttributeValues: {
        ":confirmTimestamp": 1519129853500,
        ":removalDate": 1521721853500,
        ":statusCreatedAtValue": "Confirmed#1519129853500",
      },
      Key: {
        FormID: "clzamy5qv0000115huc4bh90m",
        NAME_OR_CONF: "NAME#01-08-a571",
      },
      TableName: "Vault",
      UpdateExpression:
        "SET #statusCreatedAtKey = :statusCreatedAtValue, ConfirmTimestamp = :confirmTimestamp, RemovalDate = :removalDate",
    });
  });

  it("fail to confirm a form submission if it does not exist", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: undefined,
    });

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrow(FormSubmissionNotFoundException);
  });

  it("fail to confirm a form submission if it is already confirmed", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: buildMockedVaultItem(
        "Confirmed",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    });

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrow(FormSubmissionAlreadyConfirmedException);
  });

  it("fail to confirm a form submission if the confirmation is incorrect", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: buildMockedVaultItem("New", "59bec64e-f656-40b8-b23d-027d3fe25539"),
    });

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrow(FormSubmissionIncorrectConfirmationCodeException);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    const customError = new Error("custom error");
    dynamoDbMock.on(GetCommand).rejectsOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "info");

    await expect(() =>
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrowError(customError);

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[dynamodb] Failed to confirm form submission. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571 / ConfirmationCode: 620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    );
  });
});
