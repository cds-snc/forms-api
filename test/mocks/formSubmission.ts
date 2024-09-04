import {
  type FormSubmission,
  FormSubmissionStatus,
} from "@src/lib/vault/dataStructures/formSubmission.js";

export function buildMockedFormSubmission(
  status: FormSubmissionStatus = FormSubmissionStatus.New
): FormSubmission {
  return {
    status,
    confirmationCode: "58386068-6ce8-4e4f-89b2-e329df9c8b42",
    answers: "Here is my form submission",
  };
}
