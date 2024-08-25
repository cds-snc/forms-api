export enum FormSubmissionStatus {
  New = "New",
  Downloaded = "Downloaded",
  Confirmed = "Confirmed",
  Problem = "Problem",
}

export interface FormSubmission {
  status: FormSubmissionStatus;
  answers: string;
}

export interface FormNewSubmission {
  createdAt: number;
  submissionName: string;
}

export function formSubmissionFromDynamoDbResponse(
  response: Record<string, unknown>,
): FormSubmission {
  return {
    status: response.Status as FormSubmissionStatus,
    answers: response.FormSubmission as string,
  };
}

export function formNewSubmissionFromDynamoDbResponse(
  response: Record<string, unknown>[],
): FormNewSubmission[] {
  return response.map((item) => {
    return {
      createdAt: item.CreatedAt as number,
      submissionName: item.Name as string,
    };
  });
}
