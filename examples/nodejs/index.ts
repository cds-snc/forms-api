import readline from "node:readline";
import filesystem from "node:fs/promises";
import type {
  FormSubmission,
  FormSubmissionProblem,
  PrivateApiKey,
} from "./types.js";
import { generateAccessToken } from "./accessTokenGenerator.js";
import { GCFormsApiClient } from "./gcFormsApiClient.js";
import { decryptFormSubmission } from "./formSubmissionDecrypter.js";
import { verifyIntegrity } from "./formSubmissionIntegrityVerifier.js";
import path from "node:path";

const IDENTITY_PROVIDER_URL = "https://auth.forms-formulaires.alpha.canada.ca";
const PROJECT_IDENTIFIER = "284778202772022819";
const GCFORMS_API_URL = "https://api.forms-formulaires.alpha.canada.ca";

async function main() {
  try {
    const privateApiKey = await loadPrivateApiKey();

    const menuSelection = await requestUserInput(`
I want to:
(1) Generate and display an access token
(2) Retrieve, decrypt and confirm form submissions
(3) Report a problem with a form submission
Selection (1):
`);

    switch (menuSelection) {
      case "2": {
        await runRetrieveDecryptAndConfirmFormSubmissions(privateApiKey);
        break;
      }
      case "3": {
        await runReportProblemWithFormSubmission(privateApiKey);
        break;
      }
      default: {
        await runGenerateAccessToken(privateApiKey);
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function runGenerateAccessToken(privateApiKey: PrivateApiKey) {
  console.info("\nGenerating access token...");

  const accessToken = await generateAccessToken(
    IDENTITY_PROVIDER_URL,
    PROJECT_IDENTIFIER,
    privateApiKey,
  );

  console.info("\nGenerated access token:");
  console.info(accessToken);
}

async function runRetrieveDecryptAndConfirmFormSubmissions(
  privateApiKey: PrivateApiKey,
) {
  console.info("\nGenerating access token...");

  const accessToken = await generateAccessToken(
    IDENTITY_PROVIDER_URL,
    PROJECT_IDENTIFIER,
    privateApiKey,
  );

  const apiClient = new GCFormsApiClient(
    privateApiKey.formId,
    GCFORMS_API_URL,
    accessToken,
  );

  console.info("\nRetrieving form template...\n");

  const formTemplate = await apiClient.getFormTemplate();

  console.info(truncateString(JSON.stringify(formTemplate)));

  console.info("\nRetrieving new form submissions...");

  const newFormSubmissions = await apiClient.getNewFormSubmissions();

  if (newFormSubmissions.length > 0) {
    console.info("\nNew form submissions:");
    console.info(newFormSubmissions.map((x) => x.name).join(", "));

    console.info("\nRetrieving, decrypting and confirming form submissions...");

    for (const newFormSubmission of newFormSubmissions) {
      console.info(`\nProcessing ${newFormSubmission.name}...\n`);

      console.info("Retrieving encrypted submission...");

      const startGetFormSubmissionTimer = performance.now();

      const encryptedSubmission = await apiClient.getFormSubmission(
        newFormSubmission.name,
      );

      const endGetFormSubmissionTimer = performance.now();

      console.info(
        `\nForm submission retrieved in ${Math.round(endGetFormSubmissionTimer - startGetFormSubmissionTimer)} ms`,
      );

      console.info("\nEncrypted submission:");
      console.info(truncateString(encryptedSubmission.encryptedResponses));

      console.info("\nDecrypting submission...");

      const decryptedFormSubmission = decryptFormSubmission(
        encryptedSubmission,
        privateApiKey,
      );

      console.info("\nDecrypted submission:");
      console.info(truncateString(decryptedFormSubmission));

      const formSubmission = JSON.parse(
        decryptedFormSubmission,
      ) as FormSubmission;

      console.info("\nVerifying submission integrity...");

      const integrityVerificationResult = verifyIntegrity(
        formSubmission.answers,
        formSubmission.checksum,
      );

      console.info(
        `\nIntegrity verification result: ${integrityVerificationResult ? "OK" : "INVALID"}`,
      );

      await saveSubmissionLocally(newFormSubmission.name, formSubmission);

      console.info("\nConfirming submission...");

      await apiClient.confirmFormSubmission(
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
}

async function saveSubmissionLocally(
  submissionName: string,
  submission: FormSubmission,
): Promise<void> {
  console.info("\nSaving submission answers...");

  const submissionFolderPath = path.join("./", submissionName);

  await filesystem.mkdir(submissionFolderPath, {
    recursive: true,
  });

  await filesystem.writeFile(
    path.join(`./${submissionName}`, "answers.json"),
    submission.answers,
  );

  if (submission.attachments) {
    console.info("\nSaving submission attachments...\n");

    for (const attachment of submission.attachments) {
      const attachmentBuffer = Buffer.from(
        attachment.base64EncodedContent,
        "base64",
      );

      await filesystem.writeFile(
        path.join(`./${submissionName}`, attachment.name),
        attachmentBuffer,
      );

      console.info(
        `Submission attachment '${attachment.name}' has been saved ${attachment.isPotentiallyMalicious ? "(flagged as potentially malicious)" : ""}`,
      );
    }
  }

  console.info(`\nSubmission saved in folder named '${submissionFolderPath}'`);
}

async function runReportProblemWithFormSubmission(
  privateApiKey: PrivateApiKey,
) {
  const submissionName = await requestUserInput("\nSubmission name:\n");

  const contactEmail = await requestUserInput("\nContact email address:\n");

  const description = await requestUserInput(
    "\nProblem description (10 characters minimum):\n",
  );

  const preferredLanguage = await requestUserInput(
    "\nPreferred communication language (either 'en' or 'fr'):\n",
  );

  console.info("\nGenerating access token...");

  const accessToken = await generateAccessToken(
    IDENTITY_PROVIDER_URL,
    PROJECT_IDENTIFIER,
    privateApiKey,
  );

  const apiClient = new GCFormsApiClient(
    privateApiKey.formId,
    GCFORMS_API_URL,
    accessToken,
  );

  console.info("\nReporting form submission...");

  const problem: FormSubmissionProblem = {
    contactEmail,
    description,
    preferredLanguage,
  };

  await apiClient.reportProblemWithFormSubmission(submissionName, problem);

  console.info("\nSubmission has been reported");
}

function loadPrivateApiKey(): Promise<PrivateApiKey> {
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

function truncateString(str: string, maxLength = 2000) {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

main();
