using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace dotnet
{
  public class GCFormsApiClient
  {
    private readonly HttpClient httpClient;

    public GCFormsApiClient(string apiUrl, string accessToken)
    {
      this.httpClient = new HttpClient()
      {
        BaseAddress = new Uri(apiUrl),
        Timeout = TimeSpan.FromSeconds(3),
      };

      // For the API to accept requests we need to set the `User-Agent` header parameter
      this.httpClient.DefaultRequestHeaders.Add("User-Agent", "GCFormsApiClient/1.0");

      this.httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }

    public Task<object> GetFormTemplate(string formId)
    {
      try
      {
        return this
          .httpClient
          .GetAsync($"/forms/{formId}/template")
          .Result
          .EnsureSuccessStatusCode()
          .Content
          .ReadFromJsonAsync<object>();
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to retrieve form template", exception);
      }
    }

    public Task<List<NewFormSubmission>> GetNewFormSubmissions(string formId)
    {
      try
      {
        return this
          .httpClient
          .GetAsync($"/forms/{formId}/submission/new")
          .Result
          .EnsureSuccessStatusCode()
          .Content
          .ReadFromJsonAsync<List<NewFormSubmission>>();
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to retrieve new form submissions", exception);
      }
    }

    public Task<EncryptedFormSubmission> GetFormSubmission(string formId, string submissionName)
    {
      try
      {
        return this
          .httpClient
          .GetAsync($"/forms/{formId}/submission/{submissionName}")
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

    public async Task ConfirmFormSubmission(string formId, string submissionName, string confirmationCode)
    {
      try
      {
        HttpResponseMessage response = await this
          .httpClient
          .PutAsync($"/forms/{formId}/submission/{submissionName}/confirm/{confirmationCode}", null);

        response.EnsureSuccessStatusCode();
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to confirm form submission", exception);
      }
    }

    public async Task ReportProblemWithFormSubmission(string formId, string submissionName, FormSubmissionProblem problem)
    {
      try
      {
        HttpResponseMessage response = await this
          .httpClient
          .PostAsync(
            $"/forms/{formId}/submission/{submissionName}/problem",
            new StringContent(JsonSerializer.Serialize(problem), Encoding.UTF8, "application/json")
          );

        response.EnsureSuccessStatusCode();
      }
      catch (Exception exception)
      {
        throw new Exception("Failed to report problem with form submission", exception);
      }
    }
  }
}