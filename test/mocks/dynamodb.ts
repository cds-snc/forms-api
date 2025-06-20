export function buildMockedVaultItem(
  status = "New",
  confirmationCode = "620b203c-9836-4000-bf30-1c3bcc26b834",
): Record<string, unknown> {
  const createdAt = Date.now();

  return {
    CreatedAt: createdAt,
    "Status#CreatedAt": `${status}#${createdAt}`,
    ConfirmationCode: confirmationCode,
    FormSubmission: '{"1":"Test response"}',
    FormSubmissionHash: "5981e9cd2a2f0032e9b8c99eb7bb8841",
  };
}
