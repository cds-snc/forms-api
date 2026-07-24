#!/bin/bash
set -euo pipefail

truncate_string() {
  local str="$1"
  local maxlen=500

  if [ ${#str} -gt "$maxlen" ]; then
    echo "${str:0:maxlen}..."
  else
    echo "$str"
  fi
}

echo -e "\nGenerating access token..."

access_token=$(./get_access_token.sh)

echo -e "\nRetrieving new form submissions..."

new_form_submissions=$(./get_new_form_submissions.sh "$access_token")

if [ "$(echo "$new_form_submissions" | jq 'length')" -gt 0 ]; then
  echo -e "\nNew form submissions:"
  echo "$new_form_submissions" | jq -r '[.[] | "\(.name) (v\(.version))"] | join(", ")'

  form_template_versions_to_download=$(echo "$new_form_submissions" | jq -c '[.[].version] | unique')

  echo -e "\nRetrieving form templates...\n";

  versions=()
  form_template_versions=()

  for version in $(jq -r '.[]' <<< "$form_template_versions_to_download"); do
    versions+=("$version")
    form_template_versions+=("$(./get_form_template.sh "$access_token" "$version")")
  done

  for i in "${!versions[@]}"; do
    echo "Form template version ${versions[$i]}:"
    echo $(truncate_string "${form_template_versions[$i]}")
    echo
  done

  echo -e "Retrieving, decrypting and confirming form submissions..."

  echo "$new_form_submissions" | jq -r '.[] | [.name, .version] | @tsv' | while IFS=$'\t' read -r new_form_submission_name new_form_submission_version; do
    echo -e "\nProcessing $new_form_submission_name...\n"

    echo "Retrieving encrypted submission..."

    encrypted_form_submission=$(./get_form_submission.sh "$access_token" "$new_form_submission_name")

    echo -e "\nEncrypted submission:"
    echo $(truncate_string $(echo "$encrypted_form_submission" | jq -r '.encryptedResponses'))

    echo -e "\nDecrypting submission..."

    decrypted_form_submission=$(./decrypt_form_submission.sh "$encrypted_form_submission")

    echo -e "\nDecrypted submission:"
    echo $(truncate_string "$decrypted_form_submission")

    echo -e "\nVerifying submission integrity...\n"

    answers=$(echo $decrypted_form_submission | jq -r '.answers')
    checksum=$(echo $decrypted_form_submission | jq -r '.checksum')
    confirmation_code=$(echo $decrypted_form_submission | jq -r '.confirmationCode')

    echo $(./validate_form_submission.sh "$answers" "$checksum")

    mkdir -p "$new_form_submission_name"

    echo -e "\nSaving submission..."

    echo "$answers" > "$new_form_submission_name/submission-answers.json"
    echo "${form_template_versions[$new_form_submission_version - 1]}" > "$new_form_submission_name/form-template.v$new_form_submission_version.json"

    list_of_attachments=$(echo "$decrypted_form_submission" | jq -c '.attachments[]?')

    if [ ! -z "$list_of_attachments" ]; then
      echo -e "\nSaving submission attachments...\n"

      echo "$list_of_attachments" | while IFS= read -r attachment; do
        file_name=$(echo "$attachment" | jq -r '.name')
        download_link=$(echo "$attachment" | jq -r '.downloadLink')
        is_potentially_malicious=$(echo "$attachment" | jq -r '.isPotentiallyMalicious')

        curl -sSL "$download_link" -o "$new_form_submission_name/$file_name"

        msg="Submission attachment '$file_name' has been saved"
        if [ "$is_potentially_malicious" = true ]; then
            msg="$msg (flagged as potentially malicious)"
        fi
        echo "$msg"
      done
    fi

    echo -e "\nSubmission saved in folder named '${new_form_submission_name}'"

    echo -e "\nConfirming submission..."

    # ./confirm_form_submission.sh "$access_token" "$new_form_submission_name" "$confirmation_code" > /dev/null

    echo -e "\nSubmission confirmed"

    read -n 1 -s -r -p $'\n=> Press enter to continue processing form submissions or Ctrl-C to exit' </dev/tty
    echo
  done
else
  echo -e "\nCould not find any new form submission!"
fi