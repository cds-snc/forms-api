import { prisma } from "@gcforms/database";
import type { FormTemplate } from "@lib/formsClient/types/formTemplate.js";
import { logMessage } from "@lib/logging/logger.js";

export async function getFormTemplate(
  formId: string,
): Promise<FormTemplate | undefined> {
  try {
    const template = await prisma.template.findUnique({
      where: {
        id: formId,
      },
      select: {
        jsonConfig: true,
      },
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
