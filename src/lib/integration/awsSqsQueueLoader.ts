import { AwsServicesConnector } from "@lib/integration/awsServicesConnector.js";
import { GetQueueUrlCommand } from "@aws-sdk/client-sqs";
import { logMessage } from "@lib/logging/logger.js";

let apiAuditLogSqsQueueUrl: string | null = null;

export function getApiAuditLogSqsQueueUrl(): Promise<string> {
  if (apiAuditLogSqsQueueUrl) {
    return Promise.resolve(apiAuditLogSqsQueueUrl);
  }

  return AwsServicesConnector.getInstance()
    .sqsClient.send(
      new GetQueueUrlCommand({
        QueueName: "api_audit_log_queue",
      }),
    )
    .then((response) => {
      if (response.QueueUrl === undefined) {
        throw new Error("Audit log SQS queue not connected");
      }

      apiAuditLogSqsQueueUrl = response.QueueUrl;

      logMessage.info(
        `Audit log SQS queue URL initialized: ${apiAuditLogSqsQueueUrl}`,
      );

      return apiAuditLogSqsQueueUrl;
    });
}
