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
| <code>429</code> |  <code>Too many requests</code>   | Refer to API rate limit for the limit number. |
| <code>500</code> |  <code>Internal server error</code>   | Internal error while serving request. |

#### Reporting errors and feedback
We expect there may be some additional features needed to get the data to target systems successfully. If you encounter an error, please submit a [technical support ticket](https://forms-formulaires.alpha.canada.ca/en/support) and we'll work with you to resolve the issue. Don't hesitate to include any feedback on the implementation so far — what works and what doesn't. Your feedback helps shape the product directly by informing our decisions on what issues are most important.

### API rate limit

API throttling allows us to manage high API traffic and helps maintain the system’s stability. This helps avoid overloading situations where too many requests are processed simultaneously. 

The limit for API requests from one form is **500 requests per minute** by default. Should you happen to exceed the limit, you will get a <code>RateLimitError</code>. You may either wait and try again, or request a higher limit for your form. If you require an API request rate increase, please [contact Support](https://forms-formulaires.alpha.canada.ca/en/support) and we'll be able to increase the limit to 1000 requests per minute for a period of time.

You can see additional information in the headers included as part of the API response: 
- <code>X-RateLimit-Limit</code>: the current limit of API requests for your form per 60 seconds
- <code>X-RateLimit-Remaining</code>: the number of remaining API requests within this 60 second interval
- <code>X-RateLimit-Reset</code>: the moment at which the limit will reset to the full limit amount
- <code>Retry-After</code>: the time in seconds to wait before sending another request to the API

In the future, we anticipate the API call limits may be tied to different use cases or types of usage and will try to determine more appropriate limits for API requests per minute. 

### Rotating API keys

Rotating an API key may become necessary if a key is compromised. You can generate a new key in form settings in the API integration tab. This also requires a change in the parameters being queried in the request.

