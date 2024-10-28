---
layout: page
title: "Making requests"
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

### Query parameters

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

### Integration examples

We’ve developed some examples that you can reference or run the program for, that we hope will help make integration easier. Here are the programming languages currently available:

- [.NET / C#](https://github.com/cds-snc/forms-api/tree/main/examples/dotnet)
- [Node.JS / Typescript](https://github.com/cds-snc/forms-api/tree/main/examples/nodejs)
- [Python](https://github.com/cds-snc/forms-api/tree/main/examples/python)
- [Bash /Curl](https://github.com/cds-snc/forms-api/tree/main/examples/bash)

### Retrieving **new** form submissions

##### HTTP request

This URL path returns a list of submissions that includes the 100 oldest form submissions marked with a “New” status: 

```
GET  /forms/{formID}/submission/new
```

_Note: The status of these form submissions will not change to “Downloaded”._

##### Response status

<table>
<tr>
  <td><b>Status code</b></td> <td><b>Example message</b></td> <td><b>Meaning or how to fix</b></td>
</tr>  
<tr>
  <td><code>200</code></td>
  <td>
<code>[
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
]</code>
  </td> 
  <td> 
  List of new submission names successfully retrieved.
  </td>
</tr>
</table>

### Retrieving **specific** form submissions

#### Getting the form submission

##### HTTP request

This URL path returns one form submission per request based on the respective submission name: 

```
GET /forms/{formID}/submission/{submissionName}
```

_Note: Retrieval is only possible for 1 submission, with 1 download per request. The status of these form submissions will not change to “Downloaded”. To change the status of the form submissions, make a request to confirm form submissions once they are properly received._

##### Response status

<table>
<tr>
  <td><b>Status code</b></td> <td><b>Example message</b></td> <td><b>Meaning or how to fix</b></td>
</tr>  
<tr>
  <td><code>200</code></td>
  <td>
<code>{
  "encryptedResponses": "IOWyM7bpo+wVCXpFkU13JeO0HcxFHTIwLX17ol+jUWdvhicIG+fJj",
  "encryptedKey": "IOWyM7bpELZg4kPBOPVe7jeHcxFHTIwLX17ol+jUw6KGictIG+fJj",
  "encryptedNonce": "GVyPXC/6UTteJ3uf8d6doBNbppHzKjEXDxwE2DXQbD30/vIxlsY",
  "encryptedAuthTag": "VRMt87LgedVo+wVCXpFkU13JeO0guDGHb48XVpvWdvhs3bv/D"
}</code>
  </td> 
  <td> 
  Encrypted data of the submission successfully retrieved.
  </td>
</tr>
<tr>
  <td><code>404</code></td>
  <td>
<code>{
  "error": "Form submission does not exist"
}</code>  
  </td> 
  <td> 
  "Form ID" and/or "Submission name" are incorrect or cannot be found.
  </td>
</tr>
</table>

#### Decrypting the data

Security of the system is paramount and it is enhanced by encrypting form submissions. While encrypted in HTTPS, we’ve added another layer of security with AES-256-GSM encryption. When you get a form submission it will be encrypted and it will come with an encrypted key, an encrypted nonce, and an encrypted AuthTag. These can be decrypted using the Private key.

### **Confirming** form submissions

The confirmation step helps ensure the form submissions are exploitable and render as expected before they are permanently removed from the GC Forms system’s database. 

##### HTTP request

This URL path confirms form submissions were successfully retrieved from the system, thus removing them:

```
PUT  /forms/{formID}/submission/{submissionName}/confirm/{confirmationCode}
```

_Note: Confirmation is only possible for one submission at a time, with one confirmation code per request. The status of that submission will be modified from “New” to “Confirmed”. This is similar to the two-step “Download” and “Sign off on removal” process in the application._

##### Response status

<table>
<tr>
  <td><b>Status code</b></td> <td><b>Example message</b></td> <td><b>Meaning or how to fix</b></td>
</tr>  
<tr>
  <td><code>200</code></td>
  <td><code>OK</code></td> 
  <td> Submission has been successfully confirmed</td>
</tr>
<tr>
  <td><code>200</code></td>
  <td>
<code>{
  "info": "Form submission is already confirmed"
}</code> 
  </td> 
  <td> 
  Submission has already been successfully confirmed.
  </td>
</tr>
<tr>
  <td><code>400</code></td>
  <td>
<code>{
  "error": "Confirmation code is incorrect"
}</code>
  </td> 
  <td> 
  Provided confirmation code is not the one associated with the submission to be confirmed.
  </td>
</tr>
<tr>
  <td><code>404</code></td>
  <td>
<code>{
  "error": "Form submission does not exist"
}</code>
  </td> 
  <td> 
  "Form ID" and/or "Submission name" are incorrect or cannot be found.
  </td>
</tr>
</table>

### Reporting a problem with a form submission

##### HTTP request

This URL path identifies a form submission as having a problem if something unexpected occurs:

```
POST  /forms/{formID}/submission/{submissionName}/problem
```

_Note: Reporting a problem is only possible for one submission at a time. You can report a problem with form submissions that are “New” or “Confirmed” as long as they have not been removed from the system. This will change the status to “Problem” and block the submission’s removal from the system until the problem is resolved._

##### Example payload for reporting a problem

To report a problem include a message formatted like the one below in the HTTP POST request body:

```
{
  “contactEmail”: “something@somethingelse.com”,
  “description”: “Here is my problem”,
  “preferredLanguage”: “en” (either “en” or “fr”)
}
```

_Note: This will be directed to our support team._


##### Response status

<table>
<tr>
  <td><b>Status code</b></td> <td><b>Example message</b></td> <td><b>Meaning or how to fix</b></td>
</tr>  
<tr>
  <td><code>200</code></td>
  <td><code>OK</code></td> 
  <td> Submission has been successfully reported as having a problem</td>
</tr>
<tr>
  <td><code>200</code></td>
  <td>
<code>
{
  "info": "Form submission is already confirmed"
}
</code>
  </td> 
  <td> 
  Submission has already been successfully reported as having a problem.
  </td>
</tr>
<tr>
  <td><code>400</code></td>
  <td>
<code>{
  "error": "Invalid payload",
  "details": [
    {
      "type": "field",
      "value": "test@cds-snc",
      "msg": "Invalid value",
      "path": "contactEmail",
      "location": "body"
    },
    {
      "type": "field",
      "value": "",
      "msg": "Must be at least 10 characters long",
      "path": "description",
      "location": "body"
    }
  ]
}</code>
  </td> 
  <td> 
  Details about why the provided payload is invalid.
  </td>
</tr>
<tr>
  <td><code>400</code></td>
  <td>
<code>{
  "error": "Form submission does not exist"
}</code> 
  </td> 
  <td> 
  “Form ID” and/or “Submission name” are incorrect or could not be found.
  </td>
</tr>
</table>

