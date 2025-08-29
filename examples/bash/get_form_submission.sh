#!/bin/bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <access_token> <submission_name>"
    exit 1
fi

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.environment"

# Retrieve the encrypted form submission
get_form_response() {
  local access_token="$1"
  local submission_name="$2"

  curl -sX GET "${api_url}/forms/${form_id}/submission/${submission_name}" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

get_form_response "$1" "$2"
