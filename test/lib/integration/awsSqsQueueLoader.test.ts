import { GetQueueUrlCommand, SQSClient } from "@aws-sdk/client-sqs";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sqsMock = mockClient(SQSClient);

describe("getApiAuditLogSqsQueueUrl should", () => {
  beforeEach(() => {
    sqsMock.reset();
    vi.clearAllMocks();
  });

  it("get SQS queue url only once when calling function", async () => {
    sqsMock.on(GetQueueUrlCommand).resolves({
      QueueUrl: "fakeQueueUrl",
    });

    await getApiAuditLogSqsQueueUrl();

    await getApiAuditLogSqsQueueUrl();

    expect(sqsMock.commandCalls(GetQueueUrlCommand).length).toEqual(1);
  });
});
