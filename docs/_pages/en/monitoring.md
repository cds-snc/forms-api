---
layout: page
title:  "Monitoring"
lang: en
permalink: "/monitoring/"
trans_url: "/monitoring/"
---

### Common errors

These are common errors that apply globally and are the same for every URL path.

| Status code              | Example message | Meaning or how to fix |
| :---------------- | :------ | :---- |
| 401       |   Unauthorized   | No access token was provided. |
| 401         |   Access token has expired   | Access token has expired |
| 403   |  Forbidden   | Could not validate access token OR "Form ID" in request is not allowed to be accessed with the provided access token. |
| 404 |  Not found   | Invalid request URL. |
| 500 |  Internal server error   | Internal error while serving request. |


### Refreshing API keys

Refreshing an API key may become necessary if a key is compromised. Keys can be revoked and regenerated, simply requiring a change in the parameters being queried in the request.

### Requesting a rate limit increase

We’ll soon be implementing API throttling and token bucket rate limits to manage high API traffic and maintain the system’s stability. This will help avoid overloading situations where too many requests are processed simultaneously. We anticipate the API limits will be tied to different use cases or types of usage and will try to determine appropriate limits for API requests per minute.

