using System.Security.Cryptography;
using System.Text;

namespace dotnet
{
  public class FormSubmissionIntegrityVerifier
  {
    public static bool VerifyIntegrity(string answers, string checksum)
    {
      try
      {
        byte[] expectedHashSequence = Convert.FromHexString(checksum);

        byte[] receivedData = Encoding.UTF8.GetBytes(answers);
        byte[] hashSequenceFromReceivedData = MD5.HashData(receivedData);

        return hashSequenceFromReceivedData.SequenceEqual(expectedHashSequence);
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to verify integrity", exception);
      }
    }
  }
}