using System.Text;
using System.Text.Json;

namespace dotnet
{
  class Program
  {
    static readonly string IDENTITY_PROVIDER_URL = "https://auth.forms-formulaires.alpha.canada.ca";
    static readonly string PROJECT_IDENTIFIER = "284778202772022819";
    static readonly string GCFORMS_API_URL = "https://api.forms-formulaires.alpha.canada.ca";

    static async Task Main(string[] args)
    {
      try
      {
        PrivateApiKey privateApiKey = LoadPrivateApiKey();

        Console.WriteLine(@"
I want to:
(1) Generate and display an access token
(2) Retrieve, decrypt and confirm form submissions
Selection (1):
");

        switch (Console.ReadLine())
        {
          case "1":
          default:
            {
              Console.WriteLine("\nGenerating access token...");
              string accessToken = await AccessTokenGenerator.Generate(IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, privateApiKey);

              Console.WriteLine("\nGenerated access token:");
              Console.WriteLine(accessToken);
            }
            break;
          case "2":
            {
              Console.WriteLine("\nForm ID to retrieve responses for:");

              string formId = Console.ReadLine();

              Console.WriteLine("\nGenerating access token...");

              string accessToken = await AccessTokenGenerator.Generate(IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, privateApiKey);

              GCFormsApiClient apiClient = new(GCFORMS_API_URL, accessToken);

              Console.WriteLine("\nRetrieving form template...\n");

              object formTemplate = await apiClient.GetFormTemplate(formId);

              Console.WriteLine(formTemplate);

              Console.WriteLine("\nRetrieving new form submissions...");

              List<NewFormSubmission> newFormSubmissions = await apiClient.GetNewFormSubmissions(formId);

              if (newFormSubmissions.Count > 0)
              {
                Console.WriteLine($"\nNew form submissions:");
                Console.WriteLine(string.Join(", ", newFormSubmissions.Select(x => x.name)));

                Console.WriteLine("\nRetrieving, decrypting and confirming form submissions...");

                foreach (NewFormSubmission submission in newFormSubmissions)
                {
                  Console.WriteLine($"\nProcessing {submission.name}...\n");

                  Console.WriteLine("Retrieving encrypted submission...");

                  EncryptedFormSubmission encryptedSubmission = await apiClient.GetFormSubmission(formId, submission.name);

                  Console.WriteLine("\nEncrypted submission:");
                  Console.WriteLine(encryptedSubmission.encryptedResponses);

                  Console.WriteLine("\nDecrypting submission...");

                  string decryptedFormSubmission = FormSubmissionDecrypter.Decrypt(encryptedSubmission, privateApiKey);

                  Console.WriteLine("\nDecrypted submission:");
                  Console.WriteLine(decryptedFormSubmission);

                  FormSubmission formSubmission = JsonSerializer.Deserialize<FormSubmission>(decryptedFormSubmission);

                  Console.WriteLine("\nConfirming submission...");

                  await apiClient.ConfirmFormSubmission(formId, submission.name, formSubmission.confirmationCode);

                  Console.WriteLine("\n=> Press any key to continue processing form submissions or Ctrl-C to exit");
                  Console.ReadKey();
                }
              }
              else
              {
                Console.WriteLine($"\nCould not find any new form submission!");
              }
            }
            break;
        }
      }
      catch (Exception exception)
      {
        Console.WriteLine(exception.ToString());
      }
    }

    static PrivateApiKey LoadPrivateApiKey()
    {
      try
      {
        string[] files = Directory.GetFiles(Directory.GetCurrentDirectory(), "*_private_api_key.json");

        if (files.Length != 1)
        {
          throw new Exception("Private API key file is either missing or there is more than one in the directory");
        }

        string privateKeyAsJsonString = File.ReadAllText(files[0], Encoding.UTF8);

        return JsonSerializer.Deserialize<PrivateApiKey>(privateKeyAsJsonString);
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to load private API key", exception);
      }

    }
  }
}

