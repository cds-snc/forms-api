using System.Text;
using System.Text.Json;

namespace dotnet
{
  class Program
  {
    static readonly string IDENTITY_PROVIDER_URL = "https://auth.forms-formulaires.alpha.canada.ca";
    static readonly string PROJECT_IDENTIFIER = "284778202772022819";
    static readonly string GCFORMS_API_URL = "https://api.forms-formulaires.alpha.canada.ca";

    static readonly HttpClient sharedHttpClient = new();

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
Selection (1):");

        switch (Console.ReadLine())
        {
          case "2":
            await RunRetrieveDecryptAndConfirmFormSubmissions(privateApiKey);
            break;
          case "3":
            await RunReportProblemWithFormSubmission(privateApiKey);
            break;
          default:
            await RunGenerateAccessToken(privateApiKey);
            break;
        }
      }
      catch (Exception exception)
      {
        Console.WriteLine(exception.ToString());
      }
    }

    static async Task RunGenerateAccessToken(PrivateApiKey privateApiKey)
    {
      Console.WriteLine("\nGenerating access token...");

      string accessToken = await AccessTokenGenerator.Generate(IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, privateApiKey);

      Console.WriteLine("\nGenerated access token:");
      Console.WriteLine(accessToken);
    }

    static async Task RunRetrieveDecryptAndConfirmFormSubmissions(PrivateApiKey privateApiKey)
    {
      Console.WriteLine("\nGenerating access token...");

      string accessToken = await AccessTokenGenerator.Generate(IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, privateApiKey);

      GCFormsApiClient apiClient = new(privateApiKey.formId, GCFORMS_API_URL, accessToken);

      Console.WriteLine("\nRetrieving form template...\n");

      object formTemplate = await apiClient.GetFormTemplate();

      Console.WriteLine(TruncateString(JsonSerializer.Serialize(formTemplate)));

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
          Console.WriteLine(TruncateString(encryptedSubmission.encryptedResponses));

          Console.WriteLine("\nDecrypting submission...");

          string decryptedFormSubmission = FormSubmissionDecrypter.Decrypt(encryptedSubmission, privateApiKey);

          Console.WriteLine("\nDecrypted submission:");
          Console.WriteLine(TruncateString(decryptedFormSubmission));

          FormSubmission formSubmission = JsonSerializer.Deserialize<FormSubmission>(decryptedFormSubmission);

          Console.WriteLine("\nVerifying submission integrity...");

          bool integrityVerificationResult = FormSubmissionIntegrityVerifier.VerifyIntegrity(formSubmission.answers, formSubmission.checksum);

          Console.WriteLine($"\nIntegrity verification result: {(integrityVerificationResult ? "OK" : "INVALID")}");

          await SaveSubmissionLocally(newFormSubmission.name, formSubmission);

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

    static async Task SaveSubmissionLocally(string submissionName, FormSubmission submission)
    {
      Console.WriteLine("\nSaving submission answers...");

      string submissionFolderPath = Path.Combine(".", submissionName);

      Directory.CreateDirectory(submissionFolderPath);

      await File.WriteAllTextAsync(Path.Combine(submissionFolderPath, "answers.json"), submission.answers);

      if (submission.attachments != null)
      {
        Console.WriteLine("\nSaving submission attachments...\n");
        await Task.WhenAll(submission.attachments.Select(t => DownloadAndSaveAttachment(t, submissionFolderPath)));
      }

      Console.WriteLine($"\nSubmission saved in folder named '{Path.GetFileName(submissionFolderPath)}'");
    }

    static Task DownloadAndSaveAttachment(Attachment attachment, string submissionFolderPath)
    {
      try
      {
        return sharedHttpClient
          .GetAsync(attachment.downloadLink, HttpCompletionOption.ResponseHeadersRead)
          .Result
          .EnsureSuccessStatusCode()
          .Content
          .CopyToAsync(new FileStream(Path.Combine(submissionFolderPath, attachment.name), FileMode.Create, FileAccess.Write, FileShare.None))
          .ContinueWith(_ => Console.WriteLine($"Submission attachment '{attachment.name}' has been saved {(attachment.isPotentiallyMalicious ? "(flagged as potentially malicious)" : "")}"));
      }
      catch (Exception exception)
      {
        throw new Exception($"Failed to download and save submission attachment {attachment.name}", exception);
      }
    }

    static async Task RunReportProblemWithFormSubmission(PrivateApiKey privateApiKey)
    {
      Console.WriteLine("\nSubmission name:");

      string? submissionName = Console.ReadLine();

      Console.WriteLine("\nContact email address:");

      string? contactEmail = Console.ReadLine();

      Console.WriteLine("\nProblem description (10 characters minimum):");

      string? description = Console.ReadLine();

      Console.WriteLine("\nPreferred communication language (either 'en' or 'fr'):");

      string? preferredLanguage = Console.ReadLine();

      Console.WriteLine("\nGenerating access token...");

      if (submissionName == null || contactEmail == null || description == null || preferredLanguage == null)
      {
        throw new Exception("Missing one or multiple user inputs");
      }

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

    static string TruncateString(string str, int maxLength = 2000)
    {
      if (string.IsNullOrEmpty(str))
        return str;

      return str.Length > maxLength ? string.Concat(str.AsSpan(0, maxLength), "...") : str;
    }
  }
}