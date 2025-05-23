#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.environment"

# Retrieve the new form submission names
get_new_form_submissions() {
  local access_token="$1"

  curl -s "$api_url/forms/$form_id/submission/new" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

read -p "Enter your access token: " access_token

get_new_form_submissions "$access_token"
