#!/bin/bash
set -euo pipefail

# Calculate the response checksum and compare it to the checksum generated
# when the form was submitted
verify_integrity() {
  local response="$1"
  local checksum="$2"
  local generated_checksum="$(echo -n "$response" | md5)"

  if [ "$generated_checksum" == "$checksum" ]; then
    echo "🎉 Form integrity is valid!"
    return 0
  else
    echo "⛔ Integrity verification failed..."
    return 1
  fi
}

read -p "Enter the form response: " response
read -p "Enter the form response checksum: " checksum

verify_integrity "$response" "$checksum"
