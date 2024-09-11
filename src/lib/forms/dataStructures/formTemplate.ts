export interface FormTemplate {
  jsonConfig: Record<string, unknown>;
}

export function formTemplateFromPostgreSqlResult(
  response: Record<string, unknown>,
): FormTemplate {
  return {
    jsonConfig: response.jsonConfig as Record<string, unknown>,
  };
}
