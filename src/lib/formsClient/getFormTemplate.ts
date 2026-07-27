import { prisma } from "@gcforms/database";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";
import { logMessage } from "@lib/logging/logger.js";

export function getFormTemplate(
  formId: string,
  version?: number,
): Promise<FormTemplate | null> {
  return (
    version !== undefined
      ? getVersionedTemplate(formId, version)
      : getLatestTemplate(formId)
  ).catch((error) => {
    logMessage.error(
      error,
      `[formsClient] Failed to retrieve form template. FormId: ${formId}${version ? ` (with version: ${version})` : ""}`,
    );

    throw error;
  });
}

function getVersionedTemplate(
  formId: string,
  version: number,
): Promise<FormTemplate | null> {
  return prisma.templateVersion
    .findUnique({
      where: {
        templateId_versionNumber: {
          templateId: formId,
          versionNumber: version,
        },
      },
      select: {
        jsonConfig: true,
      },
    })
    .then((result) => (result ? (result as FormTemplate) : null));
}

function getLatestTemplate(formId: string): Promise<FormTemplate | null> {
  return prisma.templateVersion
    .findFirst({
      where: {
        templateId: formId,
      },
      orderBy: {
        versionNumber: "desc",
      },
      select: {
        jsonConfig: true,
      },
    })
    .then((template) => {
      if (template !== null) {
        return template as FormTemplate;
      }

      // Fallback query to be deleted once form versioning is fully released in Production
      return prisma.template
        .findUnique({
          where: {
            id: formId,
          },
          select: {
            jsonConfig: true,
          },
        })
        .then((result) => (result ? (result as FormTemplate) : null));
    });
}
