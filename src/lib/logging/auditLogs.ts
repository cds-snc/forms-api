import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { logMessage } from "@lib/logging/logger.js";

import { EnvironmentMode, ENVIRONMENT_MODE } from "@config";

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
  // Auth Events
  IntrospectedAccessToken = "IntrospectedAccessToken",
  InvalidAccessToken = "InvalidAccessToken",
}

export type AuditLogEventStrings = keyof typeof AuditLogEvent;

export enum AuditSubjectType {
  ServiceAccount = "ServiceAccount",
  Form = "Form",
  Response = "Response",
}

export type AuditLog = {
  userId: string;
  subject: { type: keyof typeof AuditSubjectType; id?: string };
  event: AuditLogEventStrings;
  description?: string;
  clientIp: string;
};

export async function auditLog(log: AuditLog): Promise<void> {
  const auditLogAsJsonString = JSON.stringify({
    timestamp: Date.now(),
    ...log,
  });

  try {
    const queueUrl = await getApiAuditLogSqsQueueUrl();

    await AwsServicesConnector.getInstance().sqsClient.send(
      new SendMessageCommand({
        // biome-ignore lint/style/useNamingConvention: AWS SDK Controlled
        MessageBody: auditLogAsJsonString,
        // biome-ignore lint/style/useNamingConvention: AWS SDK Controlled
        QueueUrl: queueUrl,
      }),
    );
    if (ENVIRONMENT_MODE === EnvironmentMode.Local) {
      logMessage.debug(`[audit-log] ${auditLogAsJsonString}`);
    }
  } catch (error) {
    logMessage.error(
      error,
      `[audit-log] Failed to send audit log to AWS SQS. Audit log: ${auditLogAsJsonString}.`,
    );
  }
}
