#!/bin/bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <access_token>"
    exit 1
fi

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

get_new_form_submissions "$1"
