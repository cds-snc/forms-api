import {
  type FormSubmission,
  FormSubmissionStatus,
  type NewFormSubmission,
} from "@src/lib/vault/dataStructures/formSubmission";

export function buildMockedFormSubmission(
  status: FormSubmissionStatus = FormSubmissionStatus.New,
): FormSubmission {
  return {
    status,
    confirmationCode: "58386068-6ce8-4e4f-89b2-e329df9c8b42",
    answers: "Here is my form submission",
  };
}

export function buildMockedNewFormSubmission(): NewFormSubmission {
  return {
    createdAt: 123,
    name: "ABC",
  };
}
