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

export interface NewFormSubmission {
  createdAt: number;
  name: string;
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

export function newFormSubmissionFromDynamoDbResponse(
  response: Record<string, unknown>[],
): NewFormSubmission[] {
  return response.map((item) => {
    return {
      createdAt: item.CreatedAt as number,
      name: item.Name as string,
    };
  });
}
