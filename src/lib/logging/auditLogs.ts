import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { getApiAuditLogSqsQueueUrl } from "@lib/integration/awsSqsQueueLoader.js";
import { logMessage } from "@lib/logging/logger.js";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@config";
import {
  RequestContextualStoreKey,
  retrieveRequestContextData,
} from "@lib/storage/requestContextualStore.js";

const AuditLogEvent = {
  // Form Response Events
  downloadResponse: "DownloadResponse",
  confirmResponse: "ConfirmResponse",
  identifyProblemResponse: "IdentifyProblemResponse",
  retrieveNewResponses: "RetrieveNewResponses",
  rateLimitExceeded: "RateLimitExceeded",
  // Application Events
  accessDenied: "AccessDenied",
  // Template Events
  retrieveTemplate: "RetrieveTemplate",
  // Auth Events
  introspectedAccessToken: "IntrospectedAccessToken",
  invalidAccessToken: "InvalidAccessToken",
} as const;

type AuditLogEvent = (typeof AuditLogEvent)[keyof typeof AuditLogEvent];

const AuditSubjectType = {
  serviceAccount: "ServiceAccount",
  form: "Form",
  response: "Response",
} as const;

type AuditSubjectType =
  (typeof AuditSubjectType)[keyof typeof AuditSubjectType];

export type AuditLog = {
  userId: string;
  subject: { type: AuditSubjectType; id?: string };
  event: AuditLogEvent;
  description?: string;
};

export async function auditLog(log: AuditLog): Promise<void> {
  const clientIp = retrieveRequestContextData(
    RequestContextualStoreKey.clientIp,
  );

  try {
    if (clientIp === undefined) {
      throw new Error(
        "[audit-log] clientIp retrieved from async context store is undefined",
      );
    }

    const auditLogAsJsonString = JSON.stringify({
      timestamp: Date.now(),
      clientIp,
      ...log,
    });

    const queueUrl = await getApiAuditLogSqsQueueUrl();

    await AwsServicesConnector.getInstance().sqsClient.send(
      new SendMessageCommand({
        // biome-ignore lint/style/useNamingConvention: AWS SDK Controlled
        MessageBody: auditLogAsJsonString,
        // biome-ignore lint/style/useNamingConvention: AWS SDK Controlled
        QueueUrl: queueUrl,
      }),
    );

    if (ENVIRONMENT_MODE === EnvironmentMode.local) {
      logMessage.debug(`[audit-log] ${auditLogAsJsonString}`);
    }
  } catch (error) {
    logMessage.error(
      error,
      `[audit-log] Failed to send audit log to AWS SQS. Audit log: ${JSON.stringify(
        {
          timestamp: Date.now(),
          clientIp: clientIp ?? "undefined",
          ...log,
        },
      )}.`,
    );
  }
}
