import { GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { AwsServicesConnector } from "./connectors/awsServicesConnector.js";
import { logMessage } from "./logger.js";
import { EnvironmentMode, ENVIRONMENT_MODE } from "@src/config.js";

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

let queueUrlRef: string | null = null;

const getQueueUrl = async () => {
  if (!queueUrlRef) {
    const data = await AwsServicesConnector.getInstance().sqsClient.send(
      new GetQueueUrlCommand({
        QueueName: "api_audit_log_queue",
      }),
    );
    queueUrlRef = data.QueueUrl ?? null;
    logMessage.debug(`Audit Log Queue URL initialized: ${queueUrlRef}`);
  }
  return queueUrlRef;
};

//Initialise the queueUrlRef on load except when running tests
// This mock should be refactored when we once we have a better way to mock the AWS SDK
process.env.NODE_ENV !== "test" && getQueueUrl();

export const logEvent = async (
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
  try {
    const queueUrl = await getQueueUrl();
    if (!queueUrl) {
      throw new Error("Audit Log Queue not connected");
    }
    await AwsServicesConnector.getInstance().sqsClient.send(
      new SendMessageCommand({
        MessageBody: auditLog,
        QueueUrl: queueUrl,
      }),
    );
  } catch (e) {
    // Only log the error in Production environment.
    // Development may be running without LocalStack setup
    if (ENVIRONMENT_MODE === EnvironmentMode.Local) {
      return logMessage.info(`AuditLog:${auditLog}`);
    }

    logMessage.error("ERROR with Audit Logging");
    logMessage.error(e as Error);
    // Ensure the audit event is not lost by sending to console
    logMessage.warn(`AuditLog:${auditLog}`);
  }
};
