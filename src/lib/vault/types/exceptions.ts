// Shared

export class FormSubmissionNotFoundException extends Error {
  constructor() {
    super("FormSubmissionNotFoundException");
    Object.setPrototypeOf(this, FormSubmissionNotFoundException.prototype);
  }
}

// Confirm

export class FormSubmissionAlreadyConfirmedException extends Error {
  constructor() {
    super("FormSubmissionAlreadyConfirmedException");
    Object.setPrototypeOf(
      this,
      FormSubmissionAlreadyConfirmedException.prototype,
    );
  }
}

export class FormSubmissionIncorrectConfirmationCodeException extends Error {
  constructor() {
    super("FormSubmissionIncorrectConfirmationCodeException");
    Object.setPrototypeOf(
      this,
      FormSubmissionIncorrectConfirmationCodeException.prototype,
    );
  }
}

// Problem

export class FormSubmissionAlreadyReportedAsProblematicException extends Error {
  constructor() {
    super("FormSubmissionAlreadyReportedAsProblematicException");
    Object.setPrototypeOf(
      this,
      FormSubmissionAlreadyReportedAsProblematicException.prototype,
    );
  }
}
