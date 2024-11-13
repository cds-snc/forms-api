import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { logMessage } from "@lib/logging/logger.js";

export enum AuditLogEvent {
  // Form Response Events
  DownloadResponse = "DownloadResponse",
  ConfirmResponse = "ConfirmResponse",
  IdentifyProblemResponse = "IdentifyProblemResponse",
  RetrieveNewResponses = "RetrieveNewResponses",
  RateLimitExceeded = "RateLimitExceeded",
  // Application Events
  AccessDenied = "AccessDenied",
  // Template Events
  RetrieveTemplate = "RetrieveTemplate",
}

export type AuditLogEventStrings = keyof typeof AuditLogEvent;

export enum AuditSubjectType {
  ServiceAccount = "ServiceAccount",
  Form = "Form",
  Response = "Response",
}

export const auditLog = async (
  userId: string,
  subject: { type: keyof typeof AuditSubjectType; id?: string },
  event: AuditLogEventStrings,
  description?: string,
): Promise<void> => {
  const auditLogAsJsonString = JSON.stringify({
    userId,
    event,
    timestamp: Date.now(),
    subject,
    description,
  });

  try {
    const queueUrl = await getApiAuditLogSqsQueueUrl();

    await AwsServicesConnector.getInstance().sqsClient.send(
      new SendMessageCommand({
        MessageBody: auditLogAsJsonString,
        QueueUrl: queueUrl,
      }),
    );
  } catch (error) {
    logMessage.error(error, "[logging] Failed to send audit log to AWS SQS");

    // Ensure the audit log is not lost by sending to console
    logMessage.warn(
      `[logging] Audit log that failed to be sent: ${auditLogAsJsonString}`,
    );
  }
};
