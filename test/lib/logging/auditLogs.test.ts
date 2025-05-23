import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { auditLog } from "@lib/logging/auditLogs.js";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { logMessage } from "@lib/logging/logger.js";

vi.unmock("@lib/logging/auditLogs");

vi.mock("@lib/integration/awsSqsQueueLoader");
vi.mocked(getApiAuditLogSqsQueueUrl).mockResolvedValue("apiAuditLogQueueUrl");

const sqsMock = mockClient(SQSClient);

describe("auditLog should", () => {
  beforeEach(() => {
    sqsMock.reset();
    vi.clearAllMocks();

    vi.useFakeTimers();
    vi.setSystemTime(new Date(1519129853500));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("successfully publish an audit log if everything goes well", async () => {
    await expect(
      auditLog(
        "userId",
        { type: "Response", id: "responseId" },
        "ConfirmResponse",
        "description",
      ),
    ).resolves.not.toThrow();

    expect(sqsMock.commandCalls(SendMessageCommand).length).toEqual(1);
    expect(sqsMock.commandCalls(SendMessageCommand)[0].args[0].input).toEqual({
      MessageBody: JSON.stringify({
        userId: "userId",
        event: "ConfirmResponse",
        timestamp: 1519129853500,
        subject: { type: "Response", id: "responseId" },
        description: "description",
      }),
      QueueUrl: "apiAuditLogQueueUrl",
    });
  });

  it("console log audit log that failed to be published because of an internal error", async () => {
    const customError = new Error("custom error");
    sqsMock.on(SendMessageCommand).rejectsOnce(customError);
    const errorLogMessageSpy = vi.spyOn(logMessage, "error");

    await auditLog(
      "userId",
      { type: "Response", id: "responseId" },
      "ConfirmResponse",
      "description",
    );

    expect(errorLogMessageSpy).toHaveBeenCalledWith(
      customError,
      `[audit-log] Failed to send audit log to AWS SQS. Audit log: ${JSON.stringify({ userId: "userId", event: "ConfirmResponse", timestamp: 1519129853500, subject: { type: "Response", id: "responseId" }, description: "description" })}.`,
    );
  });
});
