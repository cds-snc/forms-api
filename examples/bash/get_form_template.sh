#!/bin/bash
set -euo pipefail

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "Usage: $0 <access_token> [version]"
  exit 1
fi

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.environment"

# Retrieve the form template
get_form_template() {
  local access_token="$1"
  local version="${2:-}"

  local url="${api_url}/forms/${form_id}/template"

  if [ -n "$version" ]; then
    url="${url}?version=${version}"
  fi

  curl -sX GET "$url" \
    -H "Authorization: Bearer $access_token" \
    -H "Content-Type: application/json"
}

get_form_template "$1" "${2:-}"
