#!/bin/bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <access_token>"
    exit 1
fi

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.environment"

# Retrieve the form template
get_form_template() {
  local access_token="$1"

  curl -sX GET "${api_url}/forms/${form_id}/template" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

get_form_template "$1"
