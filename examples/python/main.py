import json
from pathlib import Path
from access_token_generator import AccessTokenGenerator
from data_structures import PrivateApiKey, FormSubmission
from gc_forms_api_client import GCFormsApiClient
from form_submission_decrypter import FormSubmissionDecrypter
from form_submission_integrity_verifier import FormSubmissionVerifier

IDENTITY_PROVIDER_URL = "https://auth.forms-staging.cdssandbox.xyz"
PROJECT_IDENTIFIER = "275372254274006635"
GCFORMS_API_URL = "https://api.forms-staging.cdssandbox.xyz"


def main() -> None:
    private_api_key = load_private_api_key()

    menu_selection = input(
    """
I want to:
(1) Generate and display an access token
(2) Retrieve, decrypt and confirm form submissions
Selection (1):
""")

    if menu_selection == "2":
        form_id = input("\nForm ID to retrieve responses for:\n")

        print("\nGenerating access token...")

        access_token = AccessTokenGenerator.generate(
            IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, private_api_key
        )

        api_client = GCFormsApiClient(GCFORMS_API_URL, access_token)

        print("\nRetrieving form template...\n")

        form_template = api_client.get_form_template(form_id)

        print(form_template)

        print("\nRetrieving new form submissions...")

        new_form_submissions = api_client.get_new_form_submissions(form_id)

        if len(new_form_submissions) > 0:
            print("\nNew form submissions:")

            print(", ".join(x.name for x in new_form_submissions))

            print("\nRetrieving, decrypting and confirming form submissions...")

            for new_form_submission in new_form_submissions:
                print(f"\nProcessing {new_form_submission.name}...\n")

                print("Retrieving encrypted submission...")

                encrypted_submission = api_client.get_form_submission(
                    form_id, new_form_submission.name
                )

                print("\nEncrypted submission:")
                print(encrypted_submission.encrypted_responses)

                print("\nDecrypting submission...")

                decrypted_form_submission = FormSubmissionDecrypter.decrypt(
                    encrypted_submission, private_api_key
                )

                print("\nDecrypted submission:")
                print(decrypted_form_submission)

                form_submission = FormSubmission.from_json(
                    json.loads(decrypted_form_submission)
                )

                print("\nVerifying submission integrity...")

                integrity_verification_result = (
                    FormSubmissionVerifier.verify_integrity(form_submission.answers, form_submission.checksum)
                )

                print(
                    f"\nIntegrity verification result: {"OK" if integrity_verification_result else "INVALID"}"
                )

                print("\nConfirming submission...")

                api_client.confirm_form_submission(form_id, new_form_submission.name, form_submission.confirmation_code)

                print("\nSubmission confirmed")

                input(
                    "\n=> Press any key to continue processing form submissions or Ctrl-C to exit"
                )
        else:
            print("\nCould not find any new form submission!")
    else:
        print("\nGenerating access token...")

        access_token = AccessTokenGenerator.generate(
            IDENTITY_PROVIDER_URL, PROJECT_IDENTIFIER, private_api_key
        )

        print("\nGenerated access token:")
        print(access_token)


def load_private_api_key() -> PrivateApiKey:
    try:
        for file_path in Path(".").glob("*_private_api_key.json"):
            if file_path.is_file():
                with open(file_path, "r") as file:
                    file_as_json_object = json.load(file)
                    return PrivateApiKey.from_json(file_as_json_object)

        raise Exception(
            "Private API key file is either missing or there is more than one in the directory"
        )
    except Exception as exception:
        raise Exception("Failed to load private API key") from exception


if __name__ == "__main__":
    main()
