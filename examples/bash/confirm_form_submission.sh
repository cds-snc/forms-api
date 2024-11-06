#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Confirm the form submission
confirm_form_submission() {
  local access_token="$1"
  local submission_name="$2"
  local confirmation_code="$3"

  curl -sX PUT "$api_url/forms/$form_id/submission/$submission_name/confirm/$confirmation_code" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

read -p "Enter the form submission name: " submission_name
read -p "Enter the form submission confirmation code: " confirmation_code
read -p "Enter your access token: " access_token

confirm_form_submission "$access_token" "$submission_name" "$confirmation_code"
