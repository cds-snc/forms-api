import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { logMessage } from "@lib/logging/logger.js";

export enum AuditLogEvent {
  // Form Response Events
  DownloadResponse = "DownloadResponse",
  ConfirmResponse = "ConfirmResponse",
  IdentifyProblemResponse = "IdentifyProblemResponse",
  RetrieveNewResponses = "RetrieveResponses",
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

export const publishAuditLog = (
  userId: string,
  subject: { type: keyof typeof AuditSubjectType; id?: string },
  event: AuditLogEventStrings,
  description?: string,
): Promise<void> => {
  const auditLog = JSON.stringify({
    userId,
    event,
    timestamp: Date.now(),
    subject,
    description,
  });

  return getApiAuditLogSqsQueueUrl()
    .then((queueUrl) =>
      AwsServicesConnector.getInstance().sqsClient.send(
        new SendMessageCommand({
          MessageBody: auditLog,
          QueueUrl: queueUrl,
        }),
      ),
    )
    .then((_) => Promise.resolve())
    .catch((error) => {
      logMessage.error(error, "[logging] Failed to send audit log to AWS SQS");

      // Ensure the audit log is not lost by sending to console
      logMessage.warn(
        `[logging] Audit log that failed to be sent: ${auditLog}`,
      );
    });
};
