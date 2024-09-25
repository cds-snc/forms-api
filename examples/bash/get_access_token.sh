#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Base64 encode a string
base64_encode() {
  openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n'
}

# Build a signed JSON Web Token (JWT) from a JSON private key file
build_jwt() {
  local json_key_file="$1"
  local private_key="$(jq -r '.key' "$json_key_file")"
  local user_id="$(jq -r '.userId' "$json_key_file")"
  local key_id="$(jq -r '.keyId' "$json_key_file")"

  local header="{
    \"alg\": \"RS256\",
    \"kid\": \"$key_id\"
  }"

  local payload="{
    \"iss\": \"$user_id\",
    \"sub\": \"$user_id\",
    \"aud\": \"$idp_url\",
    \"iat\": $(date +%s),
    \"exp\": $(($(date +%s) + 1800))
  }"

  # Base64 encode the header and payload and concatenate them to create the unsigned token
  local encoded_header=$(echo -n "$header" | base64_encode)
  local encoded_payload=$(echo -n "$payload" | base64_encode)
  local unsigned_token="${encoded_header}.${encoded_payload}"

  # Create the signature. This is used to prove that you are the owner of the private key
  local signature=$(echo -n "$unsigned_token" | openssl dgst -sha256 -sign <(echo "$private_key") | base64_encode)

  # Concatenate the unsigned token and signature to create the signed JWT
  echo "${unsigned_token}.${signature}"
}

# Request an access token from the Identity Provider
get_access_token() {
  local idp_url="$1"
  local jwt="$2"
  local project_id="$3"

  curl -sX POST "${idp_url}/oauth/v2/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
    -d "assertion=$jwt" \
    -d "scope=openid profile urn:zitadel:iam:org:project:id:${project_id}:aud" | jq -r '.access_token'
}

jwt="$(build_jwt "$json_key_file")"
get_access_token "$idp_url" "$jwt" "$project_id"
