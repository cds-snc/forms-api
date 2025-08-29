---
layout: page
title:  "Authentification"
lang: fr
permalink: "/authentification/"
trans_url: "/authentication/"
---

### URL de base

<code>
https://api.forms-formulaires.alpha.canada.ca/
</code>


> _Remarque : il se pourrait que vous deviez utiliser un fournisseur d’infonuagique comme Microsoft Azure ou Amazon Web Services (AWS) pour obtenir cet accès._

### Fonctionnement de l'authentification

L’API de Formulaires GC exploite un flux de jeton Web JSON OAuth 2.0 signé ([JWT](https://jwt.io/)) avec un fournisseur d’identité autohébergé (IDP), Zitadel, pour établir l’authentification entre des machines de manière sécurisée pour le point de terminaison d’API. 

L’authentification se fait par l’intermédiaire d’un jeton opaque et l’autorisation de base est gérée par le biais du profil utilisateur et de l’identifiant du formulaire demandé. Le serveur OAuth fournit un jeton d’accès de courte durée qui peut être utilisé pour faire des demandes API en vérifiant le JWT du client qui a été signé avec une clé privée et qui comprend son identifiant de client. Ce jeton d’accès est valable 30 minutes. 

L’API requiert une authentification à l’aide d’une adresse courriel du gouvernement du Canada, d’un **identifiant de formulaire** connexe et d’un JWT signé avec une **clé privée** et vérifié par l’intermédiaire d’une **clé publique** avec l’IDP. Ce jeton requiert l’identifiant de formulaire connexe.

### Exemples d’intégration

Une fois le formulaire créé, vous pouvez remplir des formulaires de manière fictive afin de simuler un formulaire actif et de tester l’intégration. 

Utilisez ces exemples comme référence pour générer des jetons d’accès dans le langage de programmation de votre choix :
- [.NET / C#](https://github.com/cds-snc/forms-api/blob/main/examples/dotnet/AccessTokenGenerator.cs)
- [Node.JS / Typescript](https://github.com/cds-snc/forms-api/blob/main/examples/nodejs/accessTokenGenerator.ts)
- [Python](https://github.com/cds-snc/forms-api/blob/main/examples/python/access_token_generator.py)
- [Bash /Curl](https://github.com/cds-snc/forms-api/blob/main/examples/bash/get_access_token.sh)

### En-tête d’autorisation

Utilisez cet en-tête pour chaque demande d’API pour confirmer votre identité :
<code>
<br>
<br> curl \
<br>   --request GET "$FORMS_URL" \
<br>   --header "Authorization: Bearer $ACCESS_TOKEN"
</code>
