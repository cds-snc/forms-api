#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Retrieve the encrypted form submission
get_form_response() {
  local form_id="$1"
  local access_token="$2"
  local submission_name="$3"

  curl -sX GET "${api_url}/forms/${form_id}/submission/${submission_name}" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

read -p "Enter the form ID: " form_id
read -p "Enter the form submission name: " submission_name
read -p "Enter your access token: " access_token

get_form_response "$form_id" "$access_token" "$submission_name"
