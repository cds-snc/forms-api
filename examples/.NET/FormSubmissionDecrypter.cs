using System.Security.Cryptography;
using System.Text;

namespace dotnet
{
  public class FormSubmissionDecrypter
  {
    public static string Decrypt(EncryptedFormSubmission encryptedSubmission, PrivateApiKey privateApiKey)
    {
      try
      {
        RSA rsa = RSA.Create();

        rsa.ImportFromPem(privateApiKey.key);

        byte[] decryptedKey = rsa.Decrypt(Convert.FromBase64String(encryptedSubmission.encryptedKey), RSAEncryptionPadding.OaepSHA256);
        byte[] decryptedNonce = rsa.Decrypt(Convert.FromBase64String(encryptedSubmission.encryptedNonce), RSAEncryptionPadding.OaepSHA256);
        byte[] decryptedAuthTag = rsa.Decrypt(Convert.FromBase64String(encryptedSubmission.encryptedAuthTag), RSAEncryptionPadding.OaepSHA256);

        byte[] encryptedData = Convert.FromBase64String(encryptedSubmission.encryptedResponses);

        AesGcm aesGcm = new(decryptedKey, 16);

        byte[] decryptedData = new byte[encryptedData.Length];

        aesGcm.Decrypt(decryptedNonce, encryptedData, decryptedAuthTag, decryptedData);

        return Encoding.UTF8.GetString(decryptedData);
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to decrypt form submission", exception);
      }
    }
  }
}