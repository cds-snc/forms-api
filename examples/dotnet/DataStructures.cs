using System.Runtime.Serialization;
using System.Text.Json.Serialization;

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

    public required ulong createdAt { get; set; }
  }

  public struct EncryptedFormSubmission
  {
    public required string encryptedResponses { get; set; }

    public required string encryptedKey { get; set; }

    public required string encryptedNonce { get; set; }

    public required string encryptedAuthTag { get; set; }
  }

  public enum FormSubmissionStatus
  {
    [EnumMember(Value = "New")]
    New,

    [EnumMember(Value = "Downloaded")]
    Downloaded,

    [EnumMember(Value = "Confirmed")]
    Confirmed,

    [EnumMember(Value = "Problem")]
    Problem,
  }

  public struct FormSubmission
  {
    public required ulong createdAt { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required FormSubmissionStatus status { get; set; }

    public required string confirmationCode { get; set; }

    public required string answers { get; set; }

    public required string checksum { get; set; }
  }
}