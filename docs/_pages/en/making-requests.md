---
layout: page
title: "Making requests"
lang: en
permalink: "/making-requests/"
trans_url: "/effectuer-des-demandes/"
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

Work with your development team to test out a draft form and ensure the API integration is receiving responses, able to decrypt, check the hash, and confirm the responses or report a problem. Once that process is complete, you are ready to publish your form with this data delivery method.

### Retrieving **new** form submissions

##### HTTP request

This URL path returns a list of submissions that includes the 100 oldest form submissions marked with a “New” status: 

<code>
GET  /forms/{formID}/submission/new
</code>

> _Note: The status of these form submissions will not change to “Downloaded”._

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

<code>
GET /forms/{formID}/submission/{submissionName}
</code>

> _Note: Retrieval is only possible for 1 submission, with 1 download per request. The status of these form submissions will not change to “Downloaded”. To change the status of the form submissions, make a request to confirm form submissions once they are properly received._

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

<code>
PUT  /forms/{formID}/submission/{submissionName}/confirm/{confirmationCode}
</code>

> _Note: Confirmation is only possible for one submission at a time, with one confirmation code per request. The status of that submission will be modified from “New” to “Confirmed”. This is similar to the two-step “Download” and “Sign off on removal” process in the application._

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

<code>
POST  /forms/{formID}/submission/{submissionName}/problem
</code>

> _Note: Reporting a problem is only possible for one submission at a time. You can report a problem with form submissions that are “New” or “Confirmed” as long as they have not been removed from the system. This will change the status to “Problem” and block the submission’s removal from the system until the problem is resolved._

##### Example payload for reporting a problem

To report a problem include a message formatted like the one below in the HTTP POST request body:

<code>
{
  “contactEmail”: “something@somethingelse.com”,
  “description”: “Here is my problem”,
  “preferredLanguage”: “en” (either “en” or “fr”)
}
</code>

> _Note: This will be directed to our support team._


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

### Getting form questions

##### HTTP request

This URL path retrieves the questions that were asked in JSON format so they can more easily be associated with the answer data retrieved:

<code>
GET  /forms/{formID}/template
</code>

> _Note: The questions will be in a data structure that is JSON format when retrieved. This helps if you’ll be transforming the data and need to match the answers to the questions._

You can configure question attributes with customizable unique **Question IDs** and **additional tags**. These two attributes can be used to help map form response data to target systems or destination fields in a database, making it easier to update API integrations with a consistent way of mapping response data. 

You might use these attributes to:
- Clarify a field's purpose 
- Organize and sort data
- Support automation

Learn more below.

##### Response status

<table>
<tr>
  <td><b>Status code</b></td> <td><b>Example message</b></td> <td><b>Meaning or how to fix</b></td>
</tr>  
<tr>
  <td><code>200</code></td>
  <td>
<code>
  {
  "layout": [
    1
  ],
  "titleEn": "Test Form",
  "titleFr": "Formulaire de test",
  "elements": [
    {
      "id": 1,
      "type": "textField",
      "properties": {
        "choices": [
          {
            "en": "",
            "fr": ""
          }
        ],
        "titleEn": "This is a question",
        "titleFr": "C'est une question",
        "validation": {
          "required": false
        },
        "subElements": [],
        "descriptionEn": "",
        "descriptionFr": "",
        "placeholderEn": "",
        "placeholderFr": ""
      }
    }
  ],
  "confirmation": {
    "descriptionEn": "Confirmed",
    "descriptionFr": "Confirmation",
    "referrerUrlEn": "",
    "referrerUrlFr": ""
  },
  "introduction": {
    "descriptionEn": "Description",
    "descriptionFr": "Description"
  },
  "privacyPolicy": {
    "descriptionEn": "Private",
    "descriptionFr": "Privé"
  }
}
</code></td> 
  <td> Form template data successfully retrieved.</td>
</tr>
<tr>
  <td><code>404</code></td>
  <td>
<code>
{
    "error": "Form template does not exist"
}
</code>
  </td> 
  <td> 
  “Form ID” is incorrect or could not be found.
  </td>

#### To set and customize unique Question IDs

The Question ID is a unique value that allows you to consistently refer to a form element so that it can be matched across republished form versions, or other data structures and systems. This can provide a more scannable and useful way to identify and reference a question field. For example, a standard way to reference all first name questions or phone numbers across forms, so they land in the right place without having to be rewired individually.

**GC Forms gives you the option to configure a single unique question ID:**

1. Create a new form or navigate to an existing form in GC Forms.
2. In “Edit”, select a question and click “More”.
3. In the modal, scroll down to “Customize API data attributes”.
4. Modify the Question ID to a unique value of your choice.

#### To label and organize data with Additional tags

The additional tags are flexible labels that allow you to add metadata to form elements so that related questions can be marked, grouped, or categorized allowing data to be read, searched, sorted, and transformed by machines more meaningfully and easily.

**GC Forms gives you the option to configure multiple tags:**

1. Create a new form or navigate to an existing form in GC Forms.
2. In “Edit”, select a question and click “More”.
3. In the modal, scroll down to “Customize API data attributes”.
4. Add multiple tags to a question to mark data in a helpful way.
