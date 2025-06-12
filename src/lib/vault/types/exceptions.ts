// Get form submission

export class FormSubmissionNotFoundException extends Error {
  constructor() {
    super("FormSubmissionNotFoundException");
    Object.setPrototypeOf(this, FormSubmissionNotFoundException.prototype);
  }
}

// Confirm form submission

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

// Report problem with form submission

export class FormSubmissionAlreadyReportedAsProblematicException extends Error {
  constructor() {
    super("FormSubmissionAlreadyReportedAsProblematicException");
    Object.setPrototypeOf(
      this,
      FormSubmissionAlreadyReportedAsProblematicException.prototype,
    );
  }
}
