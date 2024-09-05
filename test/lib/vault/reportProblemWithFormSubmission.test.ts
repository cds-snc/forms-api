import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { reportProblemWithFormSubmission } from "@lib/vault/reportProblemWithFormSubmission";
import { FormSubmissionNotFoundException } from "@src/lib/vault/dataStructures/exceptions";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("reportProblemWithFormSubmission should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  it("successfully report a problem with a form submission if DynamoDB update operation did not throw any error", async () => {
    dynamoDbMock.on(UpdateCommand).resolvesOnce({});

    await expect(
      reportProblemWithFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
      ),
    ).resolves.not.toThrow();
  });

  it("fail to report a problem with a form submission if DynamoDB update operation throws ConditionalCheckFailedException", async () => {
    dynamoDbMock.on(UpdateCommand).rejectsOnce(
      new ConditionalCheckFailedException({
        $metadata: {},
        message: "",
      }),
    );

    await expect(
      reportProblemWithFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
      ),
    ).rejects.toThrow(FormSubmissionNotFoundException);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    dynamoDbMock.on(UpdateCommand).rejectsOnce("custom error");
    const consoleErrorLogSpy = vi.spyOn(console, "error");

    await expect(() =>
      reportProblemWithFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
      ),
    ).rejects.toThrowError("custom error");

    expect(consoleErrorLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[dynamodb] Failed to report problem with form submission. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571. Reason:",
      ),
    );
  });
});
