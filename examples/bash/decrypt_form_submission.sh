#!/bin/bash
set -euo pipefail

# Load environment vars
script_dir=$(dirname "$(realpath "$0")")
source "$script_dir/.env.staging"

# Decrypt with the private key and return base64 output
decrypt_with_private_key() {
  local encrypted_data="$1"
  local private_key="$2"
  echo "$encrypted_data" | base64 -d | openssl pkeyutl -decrypt -inkey <(echo "$private_key") -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 | base64
}

read -p "Enter the path to the encrypted form submission JSON: " form_submission_json

# Pull the values out of the response JSON
encrypted_key="$(jq -r '.encryptedKey' "$form_submission_json")"
encrypted_nonce="$(jq -r '.encryptedNonce' "$form_submission_json")"
encrypted_auth_tag="$(jq -r '.encryptedAuthTag' "$form_submission_json")"
encrypted_responses="$(jq -r '.encryptedResponses' "$form_submission_json")"

# Decrypt the key, nonce, and auth tag using the private key
private_key="$(jq -r '.key' "$json_key_file")"
decrypted_key="$(decrypt_with_private_key "$encrypted_key" "$private_key")"
decrypted_nonce="$(decrypt_with_private_key "$encrypted_nonce" "$private_key")"
decrypted_auth_tag="$(decrypt_with_private_key "$encrypted_auth_tag" "$private_key")"

# Decrypt AES-256-GCM encrypted response.
# This is done using Node.js as there is not a way to do this using supported versions of openssl.
decrypted_responses="$(node decrypter "$encrypted_responses" "$decrypted_key" "$decrypted_nonce" "$decrypted_auth_tag")"

echo "$decrypted_responses"
