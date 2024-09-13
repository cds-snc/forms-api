# GC Forms API client example in .NET

## Prerequisites

- Download and install .NET version 8.0
  - (with Microsoft installer) https://dotnet.microsoft.com/en-us/download
  - (with Brew) `brew install --cask dotnet-sdk`

To make sure .NET is properly installed, try to run the following command `dotnet --version`.

## How to setup application

- Put the private key file you have generated through the GCForms web application in this folder next to the `Program.cs` file. Make sure the file name ends with `_private_api_key.json`
- In the `Program.cs` file set the following variables:
  - `IDENTITY_PROVIDER_URL`: This is the URL of the identity provider (IDP)
  - `PROJECT_IDENTIFIER`: This is the GCForms project identifier in the IDP
  - `GCFORMS_API_URL`: This is the URL of the GCForms API

## How to run application

```shell
$ dotnet run
```