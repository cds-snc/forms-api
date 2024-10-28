---
layout: page
title:  "Making requests"
lang: en
permalink: "/making-requests/"
trans_url: "/faire-des-requetes/"
childPages: 
  - Retrieving new form submissions
  - Retrieving specific form submissions
  - Confirming form submissions
  - Reporting a problem with a form submission
  - Getting form questions
---

The GC Forms API allows you to retrieve form submissions as files in JSON file format. You can get up to 100 form submissions in a batch, and these are available for up to 30 days after submission, given our current data retention periods. Form submissions are encrypted with a public key and can be decrypted by you locally.

**Query parameters**
The API requests for GC Forms submission data are possible using query parameters such as:


- **{formID}**
  25-character alphanumeric string found at the end of the URL for the form or at the start of the 
  file name of the API key. 
  For example: ```clzvj8fzb00226o90r2b7l1gt```.


- **{SubmissionName}**
  11-character alphanumeric including dashes, sometimes also called the SubmissionID in the GC Forms 
  app. 
  For example: ```e02-08-d732```.


- **{ConfirmationCode}**
  36-character alphanumeric string that includes dashes, sometimes also called the Receipt code in the 
  GC Forms app. 
  For example: ```620b203c-9836-4000-bf30-1c3bcc26b834```.

**Examples**

We’ve developed some examples that you can reference or run the program for, that we hope will help make integration easier. Here are the programming languages currently available:

- [.NET / C#](https://github.com/cds-snc/forms-api/tree/main/examples/dotnet)
- [Node.JS / Typescript](https://github.com/cds-snc/forms-api/tree/main/examples/nodejs)
- [Python](https://github.com/cds-snc/forms-api/tree/main/examples/python)
- [Bash /Curl](https://github.com/cds-snc/forms-api/tree/main/examples/bash)

## Retrieving **new** form submissions

### HTTP request

This URL path returns a list of submissions that includes the 100 oldest form submissions marked with a “New” status: 

```GET  /forms/{formID}/submission/new```

_Note: The status of these form submissions will not change to “Downloaded”._

### Response status

<table>
<tr>
  <td> **Status code** </td> <td> **Example message** </td> <td> **Meaning or how to fix** </td>
</tr>  
<tr>
  <td> 200 </td>
  <td>
  ```json
[
  {
    "name": "05-09-09f4",
    "createdAt": 1725553403512
  },
  {
    "name": "05-09-9620",
    "createdAt": 1725553404965
  },
  {
    "name": "05-09-75dc",
    "createdAt": 1725553404972
  }
]
    ```  
  </td> 
  <td> 
  List of new submission names successfully retrieved.
  </td>
</tr>
</table>
