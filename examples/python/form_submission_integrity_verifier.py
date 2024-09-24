import hashlib


class FormSubmissionVerifier:

    def verify_integrity(answers: str, checksum: str) -> bool:
        try:
            expected_hash_sequence = bytes.fromhex(checksum)

            received_data = answers.encode("utf-8")
            hash_sequence_from_received_data = hashlib.md5(received_data).digest()

            return hash_sequence_from_received_data == expected_hash_sequence
        except Exception as exception:
            raise Exception("Failed to verify integrity") from exception
