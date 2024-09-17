import readline from "node:readline";
import filesystem from "node:fs/promises";
import type { FormSubmission, PrivateApiKey } from "./types.js";
import { generateAccessToken } from "./accessTokenGenerator.js";
import { GCFormsApiClient } from "./gcFormsApiClient.js";
import { decryptFormSubmission } from "./formSubmissionDecrypter.js";
import { verifyIntegrity } from "./formIntegrityVerification.js";

const IDENTITY_PROVIDER_URL = "https://auth.forms-staging.cdssandbox.xyz";
const PROJECT_IDENTIFIER = "275372254274006635";
const GCFORMS_API_URL = "https://api.forms-staging.cdssandbox.xyz";

async function main() {
  try {
    const privateApiKey = await loadPrivateKey();

    const menuSelection = await requestUserInput(`
I want to:
(1) Generate and display an access token
(2) Retrieve, decrypt and confirm form submissions
Selection (1):
`);

    switch (menuSelection) {
      case "2": {
        const formId = await requestUserInput(
          "\nForm ID to retrieve responses for:\n",
        );

        console.info("\nGenerating access token...");

        const accessToken = await generateAccessToken(
          IDENTITY_PROVIDER_URL,
          PROJECT_IDENTIFIER,
          privateApiKey,
        );

        const apiClient = new GCFormsApiClient(GCFORMS_API_URL, accessToken);

        console.info("\nRetrieving form template...\n");

        const formTemplate = await apiClient.getFormTemplate(formId);

        console.info(formTemplate);

        console.info("\nRetrieving new form submissions...");

        const newFormSubmissions =
          await apiClient.getNewFormSubmissions(formId);

        if (newFormSubmissions.length > 0) {
          console.info("\nNew form submissions:");
          console.info(newFormSubmissions.map((x) => x.name).join(", "));

          console.info(
            "\nRetrieving, decrypting and confirming form submissions...",
          );

          for (const newFormSubmission of newFormSubmissions) {
            console.info(`\nProcessing ${newFormSubmission.name}...\n`);

            console.info("Retrieving encrypted submission...");

            const encryptedSubmission = await apiClient.getFormSubmission(
              formId,
              newFormSubmission.name,
            );

            console.info("\nEncrypted submission:");
            console.info(encryptedSubmission.encryptedResponses);

            console.info("\nDecrypting submission...");

            const decryptedFormSubmission = decryptFormSubmission(
              encryptedSubmission,
              privateApiKey,
            );

            console.info("\nDecrypted submission:");
            console.info(decryptedFormSubmission);

            const formSubmission = JSON.parse(
              decryptedFormSubmission,
            ) as FormSubmission;

            console.info("\nVerifying submission integrity...");

            const verified = verifyIntegrity(
              formSubmission.answers,
              formSubmission.checksum,
            );
            console.info(
              `Submission Integrity: ${verified ? "OK" : "INVALID"}`,
            );

            console.info("\nConfirming submission...");

            await apiClient.confirmFormSubmission(
              formId,
              newFormSubmission.name,
              formSubmission.confirmationCode,
            );

            console.info("\nSubmission confirmed");

            await requestUserInput(
              "\n=> Press any key to continue processing form submissions or Ctrl-C to exit",
            );
          }
        } else {
          console.info("\nCould not find any new form submission!");
        }
        break;
      }

      default: {
        console.info("\nGenerating access token...");

        const accessToken = await generateAccessToken(
          IDENTITY_PROVIDER_URL,
          PROJECT_IDENTIFIER,
          privateApiKey,
        );

        console.info("\nGenerated access token:");
        console.info(accessToken);
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function loadPrivateKey(): Promise<PrivateApiKey> {
  return filesystem
    .readdir(".")
    .then((files) => {
      const validFiles = files.filter((fileName) =>
        fileName.endsWith("_private_api_key.json"),
      );

      if (validFiles.length !== 1) {
        throw new Error(
          "Private API key file is either missing or there is more than one in the directory",
        );
      }

      return validFiles[0];
    })
    .then((privateApiKeyFileName) => {
      return filesystem.readFile(`./${privateApiKeyFileName}`, {
        encoding: "utf8",
      });
    })
    .then((privateKeyAsJsonString) => {
      return JSON.parse(privateKeyAsJsonString) as PrivateApiKey;
    })
    .catch((error) => {
      throw new Error("Failed to load private API key", { cause: error });
    });
}

function requestUserInput(question: string): Promise<string> {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    readlineInterface.question(question, (response) => {
      readlineInterface.close();
      resolve(response);
    }),
  );
}

main();
