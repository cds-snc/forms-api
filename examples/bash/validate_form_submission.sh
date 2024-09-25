#!/bin/bash
set -euo pipefail

# Calculate the form response's 'answers' checksum and compare it to the checksum
# calculated at submission. The form response JSON has the following structure:
#
#  {
#    "createdAt": 1727113808283,
#    "status": "New",
#    "confirmationCode": "9749d99c-39ff-4414-9c8d-dbe84d365dab",
#    "answers": "{\"1\":\"No\"}",
#    "checksum": "2adcbc76dce581487b0e234343fb5fad"
#  }
#
# When calculating the checksum, include the full 'answers' property
# without the surrounding quotes:
#
#  {\"1\":\"No\"}
verify_integrity() {
  local answers="$1"
  local checksum="$2"
  local generated_checksum="$(echo -n "$answers" | md5)"

  if [ "$generated_checksum" == "$checksum" ]; then
    echo "🎉 Form integrity is valid!"
    return 0
  else
    echo "⛔ Integrity verification failed..."
    return 1
  fi
}

read -p "Enter the form response 'answers' property: " answers
read -p "Enter the form response 'checksum' property: " checksum

verify_integrity "$answers" "$checksum"
