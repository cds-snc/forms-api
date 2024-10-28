---
layout: page
title:  "Authentication"
lang: en
permalink: "/authentication/"
trans_url: "/authentification/"
---

### Base URL

**Now: _Staging_** currently available for prototyping purposes (temporarily)
```https://api.forms-staging.cdssandbox.xyz/```

>[!Note]
> **Coming soon:** Production version (not yet available for real live forms)
> ```[https://api.forms-staging.cdssandbox.xyz/](https://api.forms-formulaires.alpha.canada.ca/)```

_Note: You may need to use a cloud provider such as Microsoft Azure or Amazon Web Services (AWS), to be able to access the endpoint._

### How authentication works

The GC Forms API leverages an OAuth 2.0 Signed JSON Web Token ([JWT](https://jwt.io/)) flow with a self-hosted Identity provider (IDP), Zitadel, to establish machine-to-machine authentication in a safe and secure way for the API endpoint. 

Authentication is done through an opaque token, with basic authorization handled via the user profile and the requested form ID. The OAuth server provides a short-lived access token that can be used to make API requests by verifying the client’s JWT that has been signed with a private key and includes their client ID. This access token is valid for 30 minutes. 

The API requires authentication with a Government of Canada email, an associated **formID**, a JWT signed with a **Private key** and verified using a **Public key** with the IDP. This token contains a claim to specify the form ID from which it is associated.

### Integration examples

Once you’ve created a form, you can submit mock form submissions to simulate an active form and be able to test the integration. 

Use these examples as a reference to generate access tokens in your preferred programming language:
- [.NET / C#](https://github.com/cds-snc/forms-api/blob/main/examples/dotnet/AccessTokenGenerator.cs)
- [Node.JS / Typescript](https://github.com/cds-snc/forms-api/blob/main/examples/nodejs/accessTokenGenerator.ts)
- [Python](https://github.com/cds-snc/forms-api/blob/main/examples/python/access_token_generator.py)
- [Bash /Curl](https://github.com/cds-snc/forms-api/blob/main/examples/bash/get_access_token.sh)

### Authorization header

Use this header for each API request to verify it’s you:

```
curl \
  --request GET "$FORMS_URL" \
  --header "Authorization: Bearer $ACCESS_TOKEN"
```
