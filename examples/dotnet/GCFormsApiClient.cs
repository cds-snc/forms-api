using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace dotnet
{
  public class GCFormsApiClient
  {
    private readonly string formId;
    private readonly HttpClient httpClient;

    public GCFormsApiClient(string formId, string apiUrl, string accessToken)
    {
      this.formId = formId;
      this.httpClient = new HttpClient()
      {
        BaseAddress = new Uri(apiUrl),
        Timeout = TimeSpan.FromSeconds(3),
      };

      // For the API to accept requests we need to set the `User-Agent` header parameter
      this.httpClient.DefaultRequestHeaders.Add("User-Agent", "GCFormsApiClient/1.0");

      this.httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }

    public Task<object> GetFormTemplate()
    {
      try
      {
        return this
          .httpClient
          .GetAsync($"/forms/{this.formId}/template")
          .Result
          .EnsureSuccessStatusCode()
          .Content
          .ReadFromJsonAsync<object>()!;
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to retrieve form template", exception);
      }
    }

    public Task<List<NewFormSubmission>> GetNewFormSubmissions()
    {
      try
      {
        return this
          .httpClient
          .GetAsync($"/forms/{this.formId}/submission/new")
          .Result
          .EnsureSuccessStatusCode()
          .Content
          .ReadFromJsonAsync<List<NewFormSubmission>>()!;
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to retrieve new form submissions", exception);
      }
    }

    public Task<EncryptedFormSubmission> GetFormSubmission(string submissionName)
    {
      try
      {
        return this
          .httpClient
          .GetAsync($"/forms/{this.formId}/submission/{submissionName}")
          .Result
          .EnsureSuccessStatusCode()
          .Content
          .ReadFromJsonAsync<EncryptedFormSubmission>();
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to retrieve form submission", exception);
      }
    }

    public Task ConfirmFormSubmission(string submissionName, string confirmationCode)
    {
      try
      {
        return this
          .httpClient
          .PutAsync($"/forms/{this.formId}/submission/{submissionName}/confirm/{confirmationCode}", null)
          .ContinueWith(t => t.Result.EnsureSuccessStatusCode());
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to confirm form submission", exception);
      }
    }

    public Task ReportProblemWithFormSubmission(string submissionName, FormSubmissionProblem problem)
    {
      try
      {
        return this
          .httpClient
          .PostAsync(
            $"/forms/{this.formId}/submission/{submissionName}/problem",
            new StringContent(JsonSerializer.Serialize(problem), Encoding.UTF8, "application/json")
          )
          .ContinueWith(t => t.Result.EnsureSuccessStatusCode());
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to report problem with form submission", exception);
      }
    }
  }
}