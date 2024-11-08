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
| <code>401</code>       |   <code>Unauthorized</code>   | No access token was provided. |
| <code>401</code>        |   <code>Access token has expired</code>   | Access token has expired |
| <code>403</code>   |  <code>Forbidden</code>   | Could not validate access token OR "Form ID" in request is not allowed to be accessed with the provided access token. |
| <code>404</code> |  <code>Not found</code>   | Invalid request URL. |
| <code>429</code> |  <code>Too many requests</code>   | The limit is 500 requests per 60 seconds. Wait and try again or request a higher limit. |
| <code>500</code> |  <code>Internal server error</code>   | Internal error while serving request. |

#### Reporting errors and feedback
We expect there may be some additional features needed to get the data to target systems successfully. If you encounter an error, please submit a [technical support ticket](https://forms-formulaires.alpha.canada.ca/en/support) and we'll work with you to resolve the issue. Don't hesitate to include any feedback on the implementation so far — what works and what doesn't. Your feedback helps shape the product directly by informing our decisions on what issues are most important.

### API rate limit

The limit for API requests from one form is **500 requests per minute**. Should you happen to exceed the limit, you will get a 429 error RateLimitError. 

### Requesting a rate limit increase

API throttling allows us to manage high API traffic and helps maintain the system’s stability. This will help avoid overloading situations where too many requests are processed simultaneously. In the future, we anticipate the API call limits may be tied to different use cases or types of usage and will try to determine appropriate limits for API requests per minute. In the meantime, if you require an API request rate increase, [contact Support](https://forms-formulaires.alpha.canada.ca/en/support).

### Refreshing API keys

Refreshing an API key may become necessary if a key is compromised. Keys can be revoked and regenerated, simply requiring a change in the parameters being queried in the request.
