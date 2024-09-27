#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Report problem with form submission
report_problem_with_form_submission() {
  local form_id="$1"
  local submission_name="$2"
  local contact_email="$3"
  local description="$4"
  local preferred_language="$5"
  local access_token="$6"

  curl -sX POST "$api_url/forms/$form_id/submission/$submission_name/problem" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json" \
    -d @- << EOF
{
  "contactEmail": "$contact_email",
  "description": "$description",
  "preferredLanguage": "$preferred_language"
}
EOF
}

read -p "Enter the form ID: " form_id
read -p "Enter the form submission name: " submission_name
read -p "Enter a contact email address: " contact_email
read -p "Enter a description of the problem (10 characters minimum): " description
read -p "Enter your preferred communication language (either 'en' or 'fr'): " preferred_language
read -p "Enter your access token: " access_token

report_problem_with_form_submission "$form_id" "$submission_name" "$contact_email" "$description" "$preferred_language" "$access_token"
