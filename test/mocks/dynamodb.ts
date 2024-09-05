export function buildMockedVaultItem(
  status = "New",
  confirmationCode = "620b203c-9836-4000-bf30-1c3bcc26b834",
): Record<string, unknown> {
  return {
    CreatedAt: Date.now(),
    Status: status,
    ConfirmationCode: confirmationCode,
    FormSubmission: '{"1":"Test response"}',
  };
}
