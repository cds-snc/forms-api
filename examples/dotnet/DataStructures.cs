namespace dotnet
{
  public struct PrivateApiKey
  {
    public required string keyId { get; set; }
    public required string key { get; set; }
    public required string userId { get; set; }
  }

  public struct NewFormSubmission
  {
    public required string name { get; set; }
  }

  public struct EncryptedFormSubmission
  {
    public required string encryptedResponses { get; set; }
    public required string encryptedKey { get; set; }
    public required string encryptedNonce { get; set; }
    public required string encryptedAuthTag { get; set; }
  }

  public struct FormSubmission
  {
    public required string confirmationCode { get; set; }
  }
}