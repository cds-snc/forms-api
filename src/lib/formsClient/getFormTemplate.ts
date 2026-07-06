import { prisma } from "@gcforms/database";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";
import { logMessage } from "@lib/logging/logger.js";

export async function getFormTemplate(
  formId: string,
  version: number,
): Promise<FormTemplate | undefined> {
  try {
    const template = await prisma.templateVersion
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
      // Fallback query to be deleted once form versioning is fully released in Production
      .then((result) => {
        if (result !== null) {
          return result;
        }

        return prisma.template.findUnique({
          where: {
            id: formId,
          },
          select: {
            jsonConfig: true,
          },
        });
      });

    if (template === null) {
      return undefined;
    }

    return template as FormTemplate;
  } catch (error) {
    logMessage.error(
      error,
      `[formsClient] Failed to retrieve form template. FormId: ${formId}`,
    );

    throw error;
  }
}
