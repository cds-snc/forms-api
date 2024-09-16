import { getFormTemplate } from "@src/lib/forms/getFormTemplate.js";
import { logMessage } from "@src/lib/logger.js";
import { type Request, type Response, Router } from "express";
import { logEvent } from "@src/lib/auditLogs.js";

export const templateApiRoute = Router({
  mergeParams: true,
});

templateApiRoute.get("/", async (request: Request, response: Response) => {
  const formId = request.params.formId;
  const serviceUserId = request.serviceUserId;

  try {
    const formTemplate = await getFormTemplate(formId);

    if (formTemplate === undefined) {
      return response
        .status(404)
        .json({ error: "Form template does not exist" });
    }

    // The serviceUserId is the form Id
    logEvent(serviceUserId, { type: "Form", id: formId }, "RetrieveTemplate");

    return response.json(formTemplate.jsonConfig);
  } catch (error) {
    logMessage.error(
      `[route] Internal error while serving request: /forms/${formId}/template. Reason: ${JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
      )}`,
    );

    return response.sendStatus(500);
  }
});
