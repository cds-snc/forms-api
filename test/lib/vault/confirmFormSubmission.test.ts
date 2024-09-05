import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { confirmFormSubmission } from "@lib/vault/confirmFormSubmission";
import {
  FormSubmissionAlreadyConfirmedException,
  FormSubmissionIncorrectConfirmationCodeException,
  FormSubmissionNotFoundException,
} from "@src/lib/vault/dataStructures/exceptions";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("confirmFormSubmission should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  it("successfully confirm a form submission if DynamoDB update operation did not throw any error", async () => {
    dynamoDbMock.on(UpdateCommand).resolvesOnce({});

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).resolves.not.toThrow();
  });

  it("fail to confirm a form submission if DynamoDB update operation throws ConditionalCheckFailedException with undefined item", async () => {
    dynamoDbMock.on(UpdateCommand).rejectsOnce(
      new ConditionalCheckFailedException({
        $metadata: {},
        message: "",
        Item: undefined,
      }),
    );

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrow(FormSubmissionNotFoundException);
  });

  it("fail to confirm a form submission if DynamoDB update operation throws ConditionalCheckFailedException with item that already has a confirmed status", async () => {
    dynamoDbMock.on(UpdateCommand).rejectsOnce(
      new ConditionalCheckFailedException({
        $metadata: {},
        message: "",
        Item: {
          Status: {
            S: "Confirmed",
          },
          ConfirmationCode: {
            S: "620b203c-9836-4000-bf30-1c3bcc26b834",
          },
        },
      }),
    );

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrow(FormSubmissionAlreadyConfirmedException);
  });

  it("fail to confirm a form submission if DynamoDB update operation throws ConditionalCheckFailedException with item that has non corresponding confirmation code", async () => {
    dynamoDbMock.on(UpdateCommand).rejectsOnce(
      new ConditionalCheckFailedException({
        $metadata: {},
        message: "",
        Item: {
          Status: {
            S: "New",
          },
          ConfirmationCode: {
            S: "bec5736a-0666-4d63-92f9-9685f21121cc",
          },
        },
      }),
    );

    await expect(
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrow(FormSubmissionIncorrectConfirmationCodeException);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    dynamoDbMock.on(UpdateCommand).rejectsOnce("custom error");
    const consoleErrorLogSpy = vi.spyOn(console, "error");

    await expect(() =>
      confirmFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
        "620b203c-9836-4000-bf30-1c3bcc26b834",
      ),
    ).rejects.toThrowError("custom error");

    expect(consoleErrorLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[dynamodb] Failed to confirm form submission. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571 / ConfirmationCode: 620b203c-9836-4000-bf30-1c3bcc26b834. Reason:",
      ),
    );
  });
});
