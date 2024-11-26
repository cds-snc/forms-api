import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { reportProblemWithFormSubmission } from "@lib/vault/reportProblemWithFormSubmission.js";
import {
  FormSubmissionAlreadyReportedAsProblematicException,
  FormSubmissionNotFoundException,
} from "@lib/vault/types/exceptions.js";
import { logMessage } from "@lib/logging/logger.js";
import { buildMockedVaultItem } from "test/mocks/dynamodb.js";

const dynamoDbMock = mockClient(DynamoDBDocumentClient);

describe("reportProblemWithFormSubmission should", () => {
  beforeEach(() => {
    dynamoDbMock.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("successfully report a problem with a form submission if everything goes well", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1519129853500));

    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: buildMockedVaultItem("New"),
    });
    dynamoDbMock.on(UpdateCommand).resolvesOnce({});

    await expect(
      reportProblemWithFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
      ),
    ).resolves.not.toThrow();

    expect(dynamoDbMock.commandCalls(UpdateCommand).length).toEqual(1);
    expect(dynamoDbMock.commandCalls(UpdateCommand)[0].args[0].input).toEqual({
      ExpressionAttributeNames: {
        "#statusCreatedAtKey": "Status#CreatedAt",
      },
      ExpressionAttributeValues: {
        ":problemTimestamp": 1519129853500,
        ":statusCreatedAtValue": "Problem#1519129853500",
      },
      Key: {
        FormID: "clzamy5qv0000115huc4bh90m",
        NAME_OR_CONF: "NAME#01-08-a571",
      },
      TableName: "Vault",
      UpdateExpression:
        "SET #statusCreatedAtKey = :statusCreatedAtValue, ProblemTimestamp = :problemTimestamp REMOVE RemovalDate",
    });
  });

  it("fail to report a problem with a form submission if it does not exist", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: undefined,
    });

    await expect(
      reportProblemWithFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
      ),
    ).rejects.toThrow(FormSubmissionNotFoundException);
  });

  it("fail to report a problem with a form submission if it has already been reported as such", async () => {
    dynamoDbMock.on(GetCommand).resolvesOnce({
      Item: buildMockedVaultItem("Problem"),
    });

    await expect(
      reportProblemWithFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
      ),
    ).rejects.toThrow(FormSubmissionAlreadyReportedAsProblematicException);
  });

  it("throw an error if DynamoDB has an internal failure", async () => {
    const customError = new Error("custom error");
    dynamoDbMock.on(GetCommand).rejectsOnce(customError);
    const logMessageSpy = vi.spyOn(logMessage, "error");

    await expect(() =>
      reportProblemWithFormSubmission(
        "clzamy5qv0000115huc4bh90m",
        "01-08-a571",
      ),
    ).rejects.toThrowError("custom error");

    expect(logMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining(
        "[dynamodb] Failed to report problem with form submission. FormId: clzamy5qv0000115huc4bh90m / SubmissionName: 01-08-a571",
      ),
    );
  });
});
