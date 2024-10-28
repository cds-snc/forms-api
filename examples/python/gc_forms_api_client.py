import httpx
from typing import List
from data_structures import (
    NewFormSubmission,
    EncryptedFormSubmission,
    FormSubmissionProblem,
)


class GCFormsApiClient:
    form_id: str
    httpClient: httpx.Client

    def __init__(self, form_id: str, api_url: str, access_token: str):
        self.form_id = form_id
        self.httpClient = httpx.Client(
            base_url=api_url,
            timeout=3,
            headers={"Authorization": f"Bearer {access_token}"},
        )

    def get_form_template(self) -> dict:
        try:
            response = self.httpClient.get(f"/forms/{self.form_id}/template")
            response.raise_for_status()
            return dict(response.json())
        except Exception as exception:
            raise Exception("Failed to retrieve form template") from exception

    def get_new_form_submissions(self) -> List[NewFormSubmission]:
        try:
            response = self.httpClient.get(f"/forms/{self.form_id}/submission/new")
            response.raise_for_status()
            return [NewFormSubmission.from_json(item) for item in response.json()]
        except Exception as exception:
            raise Exception("Failed to retrieve new form submissions") from exception

    def get_form_submission(self, submission_name: str) -> EncryptedFormSubmission:
        try:
            response = self.httpClient.get(
                f"/forms/{self.form_id}/submission/{submission_name}"
            )
            response.raise_for_status()
            return EncryptedFormSubmission.from_json(response.json())
        except Exception as exception:
            raise Exception("Failed to retrieve form submission") from exception

    def confirm_form_submission(
        self, submission_name: str, confirmation_code: str
    ) -> None:
        try:
            response = self.httpClient.put(
                f"/forms/{self.form_id}/submission/{submission_name}/confirm/{confirmation_code}"
            )
            response.raise_for_status()
        except Exception as exception:
            raise Exception("Failed to confirm form submission") from exception

    def report_problem_with_form_submission(
        self, submission_name: str, problem: FormSubmissionProblem
    ) -> None:
        try:
            response = self.httpClient.post(
                f"/forms/{self.form_id}/submission/{submission_name}/problem",
                json=problem.to_json(),
            )
            response.raise_for_status()
        except Exception as exception:
            raise Exception(
                "Failed to report problem with form submission"
            ) from exception
