#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Base64 encode a string
base64_encode() {
  openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n'
}

#
# 1. Load the private key details from the *_private_api_key.json file
#
private_key="$(jq -r '.key' "$json_key_file")"
user_id="$(jq -r '.userId' "$json_key_file")"
key_id="$(jq -r '.keyId' "$json_key_file")"

#
# 2. Define the JWT elements
#
header=$(cat <<EOF
{
  "alg": "RS256",
  "kid": "$key_id"
}
EOF
)

payload=$(cat <<EOF
{
  "iss": "$user_id",
  "sub": "$user_id",
  "aud": "$idp_url",
  "iat": $(date +%s),
  "exp": $(($(date +%s) + 1800))
}
EOF
)

# Base64 encode the header and payload and concatenate them
encoded_header=$(echo -n "$header" | base64_encode)
encoded_payload=$(echo -n "$payload" | base64_encode)
unsigned_token="${encoded_header}.${encoded_payload}"

# Create the signature. This is used to prove that you are the owner of the private key
signature=$(echo -n "$unsigned_token" | openssl dgst -sha256 -sign <(echo "$private_key") | base64_encode)

# Concatenate the unsigned token and signature to create the JWT
jwt="${unsigned_token}.${signature}"

#
# 3. Request an access token using the signed JWT
#
curl -sX POST "${idp_url}/oauth/v2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
  -d "assertion=$jwt" \
  -d "scope=openid profile urn:zitadel:iam:org:project:id:${procject_id}:aud" | jq -r '.access_token'