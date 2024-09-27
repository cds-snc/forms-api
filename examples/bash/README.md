# GC Forms API examples using Bash

## Prerequisites

An environment where you can execute Bash scripts with the following tools installed:
- [`jq`](https://jqlang.github.io/jq/download/)
- [`Node.js`](https://nodejs.org/en/download/package-manager) (decryption only)
- [`openssl`](https://openssl-library.org/source/index.html)

## How to run the script

Put the private key file you have generated through the GCForms web application in this folder. Make sure the file name ends with `_private_api_key.json`.

## How to run scripts

The scripts are meant to be run in order to give you an idea of how the request flow works.

1. `get_access_token.sh`: generates a JSON web token and request an access key.
2. `get_new_form_submissions.sh`: retrieves a list of submissions for your form.  The form ID is the first part of your private key's filename.
3. `get_form_submission.sh`: retrieves an encrypted form response.  Use one of the form submission name properties from the new form submissions. 
4. `decrypt_form_submission.sh`: decrypt a retrieved form submission.  The easiest to test this is as follows:
```sh
# Capture the encrypted response in a file
./get_form_submission.sh > form_response.json
./decrypt_form_submission.sh
```
5. `validate_form_submission.sh`: checks that the form submission has not been altered during transit.  The 'answers' and 'checksum' values are part of the decrypted form response.
6. `confirm_form_submission.sh`: confirms receipt of a form submission.  The confirmation code is included with the decrypted form response.
7. `get_form_template.sh`: optionally, retrieve the form template used by GC Forms to build and display the form to users.

To report a problem with a form submission you have downloaded you can use `report_problem_with_form_submission.sh`.
