import axios, { type AxiosInstance } from "axios";
import type {
  EncryptedFormSubmission,
  FormTemplate,
  NewFormSubmission,
} from "./types.js";

export class GCFormsApiClient {
  private httpClient: AxiosInstance;

  public constructor(apiUrl: string, accessToken: string) {
    this.httpClient = axios.create({
      baseURL: apiUrl,
      timeout: 3000,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  public getFormTemplate(formId: string): Promise<FormTemplate> {
    return this.httpClient
      .get<FormTemplate>(`/forms/${formId}/template`)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error("Failed to retrieve form template", { cause: error });
      });
  }

  public getNewFormSubmissions(formId: string): Promise<NewFormSubmission[]> {
    return this.httpClient
      .get<NewFormSubmission[]>(`/forms/${formId}/submission/new`)
      .then((response) => response.data)
      .catch((error) => {
        throw new Error("Failed to retrieve new form submissions", {
          cause: error,
        });
      });
  }

  public getFormSubmission(
    formId: string,
    submissionName: string,
  ): Promise<EncryptedFormSubmission> {
    return this.httpClient
      .get<EncryptedFormSubmission>(
        `/forms/${formId}/submission/${submissionName}`,
      )
      .then((response) => response.data)
      .catch((error) => {
        throw new Error("Failed to retrieve form submission", { cause: error });
      });
  }

  public confirmFormSubmission(
    formId: string,
    submissionName: string,
    confirmationCode: string,
  ): Promise<void> {
    return this.httpClient
      .put<void>(
        `/forms/${formId}/submission/${submissionName}/confirm/${confirmationCode}`,
      )
      .then((_) => Promise.resolve())
      .catch((error) => {
        throw new Error("Failed to confirm form submission", { cause: error });
      });
  }
}
