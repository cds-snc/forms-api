#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Retrieve the form template
get_form_template() {
  local access_token="$1"

  curl -sX GET "${api_url}/forms/${form_id}/template" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

read -p "Enter your access token: " access_token

get_form_template "$access_token"
