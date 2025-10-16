from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


@dataclass
class PrivateApiKey:
    key_id: str
    key: str
    user_id: str
    form_id: str

    @staticmethod
    def from_json(json_object: dict) -> "PrivateApiKey":
        return PrivateApiKey(
            key_id=json_object["keyId"],
            key=json_object["key"],
            user_id=json_object["userId"],
            form_id=json_object["formId"],
        )


@dataclass
class NewFormSubmission:
    name: str
    created_at: int

    @staticmethod
    def from_json(json_object: dict) -> "NewFormSubmission":
        return NewFormSubmission(
            name=json_object["name"],
            created_at=json_object["createdAt"],
        )


@dataclass
class EncryptedFormSubmission:
    encrypted_key: str
    encrypted_nonce: str
    encrypted_auth_tag: str
    encrypted_responses: str

    @staticmethod
    def from_json(json_object: dict) -> "EncryptedFormSubmission":
        return EncryptedFormSubmission(
            encrypted_responses=json_object["encryptedResponses"],
            encrypted_key=json_object["encryptedKey"],
            encrypted_nonce=json_object["encryptedNonce"],
            encrypted_auth_tag=json_object["encryptedAuthTag"],
        )


class FormSubmissionStatus(Enum):
    New = "New"
    Downloaded = "Downloaded"
    Confirmed = "Confirmed"
    Problem = "Problem"


@dataclass
class Attachment:
    name: str
    download_link: str
    is_potentially_malicious: bool

    @staticmethod
    def from_json(json_object: dict) -> "Attachment":
        return Attachment(
            name=json_object["name"],
            download_link=json_object["downloadLink"],
            is_potentially_malicious=json_object["isPotentiallyMalicious"],
        )


@dataclass
class FormSubmission:
    created_at: int
    status: FormSubmissionStatus
    confirmation_code: str
    answers: str
    checksum: str
    attachments: Optional[List[Attachment]]

    @staticmethod
    def from_json(json_object: dict) -> "FormSubmission":
        return FormSubmission(
            created_at=json_object["createdAt"],
            status=json_object["status"],
            confirmation_code=json_object["confirmationCode"],
            answers=json_object["answers"],
            checksum=json_object["checksum"],
            attachments=(
                [Attachment.from_json(obj) for obj in json_object["attachments"]]
                if json_object.get("attachments")
                else None
            ),
        )


@dataclass
class FormSubmissionProblem:
    contact_email: str
    description: str
    preferred_language: str

    def to_json(self) -> dict:
        return {
            "contactEmail": self.contact_email,
            "description": self.description,
            "preferredLanguage": self.preferred_language,
        }
