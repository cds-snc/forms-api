---
layout: page
title:  "Getting started"
lang: en
permalink: "/getting-started/"
trans_url: "/pour-commencer/"
---

### Overview

The purpose of this API is to allow you to securely and reliably retrieve form submissions directly from an API endpoint. Eventually, this should alleviate the effort associated for high volumes of form submissions. So, rather than having to manually download and sign off on the removal of responses to confirm their retrieval from the database, the API will automate the workflow with systems that talk to each other and exchange data. 

### What you will need
  - A **[GC Forms account](https://articles.alpha.canada.ca/forms-formulaires/)**
  - A draft form (Unclassified or Protected A) set to deliver responses via “Download” in Settings 
  - A few “mock” responses submitted to the form
  - A target system where you plan on receiving form submission data
  - Infrastructure development resources who can craft HTTP requests and use Azure or AWS to reach the API
     - _No infrastructure development capabilities available? This first version of the API might not be ready for you just yet. Consider choosing an alternative [no-code delivery option](https://articles.alpha.canada.ca/forms-formulaires/getting-form-responses/) to get responses by email or download them from GC Forms instead._
  - An API key **(JSON file provided by our [Support team](https://forms-formulaires.alpha.canada.ca/en/support) by encrypted email)**
     - In the support request, in "Tell us more" include the form ID and the email address of the developer who will set up the API integration

_> **No infrastructure development capabilities available?**
> This first version of the API might not be ready for you just yet. Consider choosing an alternative [no-code delivery option](https://articles.alpha.canada.ca/forms-formulaires/getting-form-responses/) to get responses by email or download them from GC Forms instead._

**> **Important** You must keep this API key secure as it is used to authenticate API requests and could be used to access protected data. Use encrypted email if you must share it with a developer team member to set up the integration.**
