export enum FormSubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export interface FormSubmission {
  status: FormSubmissionStatus;
  confirmationCode: string;
  answers: string;
}

export function formSubmissionFromDynamoDbResponse(
  response: Record<string, unknown>,
): FormSubmission {
  return {
    status: response.Status as FormSubmissionStatus,
    confirmationCode: response.ConfirmationCode as string,
    answers: response.FormSubmission as string,
  };
}
