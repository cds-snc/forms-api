using System.Text;
using System.Text.Json;

namespace dotnet
{
  class Program
  {
    static readonly string IDENTITY_PROVIDER_URL = "https://auth.forms-staging.cdssandbox.xyz";
    static readonly string PROJECT_IDENTIFIER = "275372254274006635";
    static readonly string GCFORMS_API_URL = "https://api.forms-staging.cdssandbox.xyz";

    static async Task Main(string[] args)
    {
      try
      {
        PrivateApiKey privateApiKey = LoadPrivateApiKey();

        Console.WriteLine(@"
I want to:
(1) Generate and display an access token
(2) Retrieve, decrypt and confirm form submissions
(3) Report a problem with a form submission
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
              Console.WriteLine("\nGenerating access token...");

              string accessToken = await AccessTokenGenerator.Generate(IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, privateApiKey);

              GCFormsApiClient apiClient = new(privateApiKey.formId, GCFORMS_API_URL, accessToken);

              Console.WriteLine("\nRetrieving form template...\n");

              object formTemplate = await apiClient.GetFormTemplate();

              Console.WriteLine(formTemplate);

              Console.WriteLine("\nRetrieving new form submissions...");

              List<NewFormSubmission> newFormSubmissions = await apiClient.GetNewFormSubmissions();

              if (newFormSubmissions.Count > 0)
              {
                Console.WriteLine($"\nNew form submissions:");
                Console.WriteLine(string.Join(", ", newFormSubmissions.Select(x => x.name)));

                Console.WriteLine("\nRetrieving, decrypting and confirming form submissions...");

                foreach (NewFormSubmission newFormSubmission in newFormSubmissions)
                {
                  Console.WriteLine($"\nProcessing {newFormSubmission.name}...\n");

                  Console.WriteLine("Retrieving encrypted submission...");

                  EncryptedFormSubmission encryptedSubmission = await apiClient.GetFormSubmission(newFormSubmission.name);

                  Console.WriteLine("\nEncrypted submission:");
                  Console.WriteLine(encryptedSubmission.encryptedResponses);

                  Console.WriteLine("\nDecrypting submission...");

                  string decryptedFormSubmission = FormSubmissionDecrypter.Decrypt(encryptedSubmission, privateApiKey);

                  Console.WriteLine("\nDecrypted submission:");
                  Console.WriteLine(decryptedFormSubmission);

                  FormSubmission formSubmission = JsonSerializer.Deserialize<FormSubmission>(decryptedFormSubmission);

                  Console.WriteLine("\nVerifying submission integrity...");

                  bool integrityVerificationResult = FormSubmissionIntegrityVerifier.VerifyIntegrity(formSubmission.answers, formSubmission.checksum);

                  Console.WriteLine($"\nIntegrity verification result: {(integrityVerificationResult ? "OK" : "INVALID")}");

                  Console.WriteLine("\nConfirming submission...");

                  await apiClient.ConfirmFormSubmission(newFormSubmission.name, formSubmission.confirmationCode);

                  Console.WriteLine("\nSubmission confirmed");

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
          case "3":
            {
              Console.WriteLine("\nSubmission name:");

              string submissionName = Console.ReadLine();

              Console.WriteLine("\nContact email address:");

              string contactEmail = Console.ReadLine();

              Console.WriteLine("\nProblem description (10 characters minimum):");

              string description = Console.ReadLine();

              Console.WriteLine("\nPreferred communication language (either 'en' or 'fr'):");

              string preferredLanguage = Console.ReadLine();

              Console.WriteLine("\nGenerating access token...");

              string accessToken = await AccessTokenGenerator.Generate(IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, privateApiKey);

              GCFormsApiClient apiClient = new(privateApiKey.formId, GCFORMS_API_URL, accessToken);

              Console.WriteLine("\nReporting form submission...");

              FormSubmissionProblem problem = new()
              {
                contactEmail = contactEmail,
                description = description,
                preferredLanguage = preferredLanguage
              };

              await apiClient.ReportProblemWithFormSubmission(submissionName, problem);

              Console.WriteLine($"\nSubmission has been reported");
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