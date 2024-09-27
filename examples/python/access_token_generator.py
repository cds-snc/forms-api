import httpx
import time
import jwt
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from typing import Dict
from data_structures import PrivateApiKey


class AccessTokenGenerator:

    @staticmethod
    def generate(
        identity_provider_url: str,
        project_identifier: str,
        private_api_key: PrivateApiKey,
    ) -> str:
        try:
            private_key = serialization.load_pem_private_key(
                private_api_key.key.encode(), password=None, backend=default_backend()
            )

            headers = {"kid": private_api_key.key_id}

            current_time = int(time.time())

            claims = {
                "iat": current_time,
                "iss": private_api_key.user_id,
                "sub": private_api_key.user_id,
                "aud": identity_provider_url,
                "exp": current_time + 60,
            }

            jwt_signed_token = jwt.encode(
                claims, private_key, algorithm="RS256", headers=headers
            )

            request_parameters: Dict[str, str] = {
                "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion": jwt_signed_token,
                "scope": f"openid profile urn:zitadel:iam:org:project:id:{project_identifier}:aud",
            }

            httpClient = httpx.Client(base_url=identity_provider_url, timeout=3)

            response = httpClient.post("/oauth/v2/token", data=request_parameters)
            response.raise_for_status()
            responseAsJson = response.json()

            return responseAsJson["access_token"]
        except Exception as exception:
            raise Exception("Failed to generate access token") from exception
