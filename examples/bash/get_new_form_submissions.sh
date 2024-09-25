#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Retrieve the new form submission names
get_new_form_submissions() {
  local form_id="$1"
  local access_token="$2"

  curl -s "$api_url/forms/$form_id/submission/new" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

read -p "Enter the form ID: " form_id
read -p "Enter your access token: " access_token

get_new_form_submissions "$form_id" "$access_token"
