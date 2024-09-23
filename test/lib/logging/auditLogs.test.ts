import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { publishAuditLog } from "@lib/logging/auditLogs.js";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { logMessage } from "@lib/logging/logger.js";

vi.unmock("@lib/logging/auditLogs");

vi.mock("@lib/integration/awsSqsQueueLoader");
vi.mocked(getApiAuditLogSqsQueueUrl).mockResolvedValue("apiAuditLogQueueUrl");

const sqsMock = mockClient(SQSClient);

describe("publishAuditLog should", () => {
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
      publishAuditLog(
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
    const warnLogMessageSpy = vi.spyOn(logMessage, "warn");
    const errorLogMessageSpy = vi.spyOn(logMessage, "error");

    await publishAuditLog(
      "userId",
      { type: "Response", id: "responseId" },
      "ConfirmResponse",
      "description",
    );

    expect(errorLogMessageSpy).toHaveBeenCalledWith(
      customError,
      expect.stringContaining("[logging] Failed to send audit log to AWS SQS"),
    );

    expect(warnLogMessageSpy).toHaveBeenCalledWith(
      `[logging] Audit log that failed to be sent: ${JSON.stringify({ userId: "userId", event: "ConfirmResponse", timestamp: 1519129853500, subject: { type: "Response", id: "responseId" }, description: "description" })}`,
    );
  });
});
