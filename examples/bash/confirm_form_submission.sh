#!/bin/bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <access_token> <submission_name> <confirmation_code>"
    exit 1
fi

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.environment"

# Confirm the form submission
confirm_form_submission() {
  local access_token="$1"
  local submission_name="$2"
  local confirmation_code="$3"

  curl -sX PUT "$api_url/forms/$form_id/submission/$submission_name/confirm/$confirmation_code" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

confirm_form_submission "$1" "$2" "$3"
