---
layout: page
title:  "Effectuer des demandes"
lang: fr
permalink: "/effectuer-des-demandes/"
trans_url: "/making-requests/"
childPages: 
  - Récupérer des nouvelles soumissions de formulaires
  - Récupérer des soumissions de formulaires spécifiques
  - Confirmer des soumissions de formulaires
  - Signaler un problème avec les soumissions de formulaire
  - Obtenir les questions du formulaire
---

L’API de Formulaires GC vous permet de récupérer des soumissions de formulaire sous forme de fichiers JSON. Vous pouvez obtenir jusqu’à 100 soumissions de formulaire par lot, et celles-ci sont accessibles jusqu’à 30 jours après la soumission, compte tenu de nos périodes actuelles de rétention des données. Les soumissions de formulaire sont chiffrées à l’aide d’une clé publique et peuvent être déchiffrées localement par vous.


### Paramètres de requête

Les demandes d’API pour les données de soumission de Formulaires GC sont possibles à l’aide de paramètres de requête tels que :
 - **{formID}**
  L'identifiant de formulaire est une chaîne alphanumérique de 25 caractères trouvée à la fin de l’URL du formulaire ou au début du nom de fichier de la clé API. 
  Par exemple : ```clzvj8fzb00226o90r2b7l1gt```.
 - **{SubmissionName}**
   Le nom de la soumission est une chaîne alphanumérique de 11 caractères, y compris les tirets, parfois appelée identifiant de soumission dans l’application Formulaires GC.  
  Par exemple : ```e02-08-d732```.
 - **{ConfirmationCode}**
   Le code de confirmation est une chaîne alphanumérique de 36 caractères, y compris les tirets, parfois appelée code de réception dans l’application Formulaires GC.  
  Par exemple : ```620b203c-9836-4000-bf30-1c3bcc26b834```. 

### Exemples d'intégration

Nous avons élaboré quelques exemples auxquels vous pouvez vous référer, ou pour lesquels vous pouvez exécuter le programme, et qui, nous l’espérons, faciliteront l’intégration. Voici les langages de programmation disponibles à l’heure actuelle :

- [.NET / C#](https://github.com/cds-snc/forms-api/tree/main/examples/dotnet)
- [Node.JS / Typescript](https://github.com/cds-snc/forms-api/tree/main/examples/nodejs)
- [Python](https://github.com/cds-snc/forms-api/tree/main/examples/python)
- [Bash /Curl](https://github.com/cds-snc/forms-api/tree/main/examples/bash)

Travaillez avec votre équipe de développement pour tester une ébauche de formulaire et vous assurer que l'intégration de l'API reçoit des réponses, qu'elle est capable de décrypter, de vérifier le hachage et de confirmer les réponses ou de signaler un problème. Une fois ce processus terminé, vous êtes prêt à publier votre formulaire avec cette méthode de livraison des données.

### Récupérer des **nouvelles** soumissions de formulaires

##### Demande HTTP

Ce chemin d’URL renvoie une liste de soumissions qui comprend les 100 plus anciennes soumissions de formulaire ayant le statut « Nouveautés » : 

<code>
GET  /forms/{formID}/submission/new
</code>

> _Remarque : Le statut de ces soumissions de formulaire ne passera pas à « Téléchargé »._

##### Statut de la réponse

<table>
<tr>
  <td><b>Code du statut</b></td> <td><b>Exemple de message</b></td> <td><b>Signification / comment corriger</b></td>
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
  Liste des nouveaux noms de soumission récupérés avec succès.
  </td>
</tr>
</table>

### Récupérer des soumissions de formulaires **spécifiques**

#### Obtenir la soumission du formulaire

##### Demande HTTP

Ce chemin d’URL renvoie une soumission de formulaire par demande en fonction du nom de soumission respectif : 
<code>
GET /forms/{formID}/submission/{submissionName}
</code>

> _Remarque : La récupération n’est possible que pour une soumission, avec un téléchargement par demande. Le statut de ces soumissions de formulaire ne passera pas à « Téléchargé ». Pour modifier le statut des soumissions de formulaires, faites une demande de confirmation des soumissions de formulaire une fois qu’elles ont été correctement reçues._

##### Statut de la réponse

<table>
<tr>
  <td><b>Code du statut</b></td> <td><b>Exemple de message</b></td> <td><b>Signification / comment corriger</b></td>
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
  Les données chiffrées de la soumission ont été récupérées avec succès.
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
  Le renseignement “Form ID” (identifiant du formulaire) ou “Submission name” (nom de soumission) est incorrect ou introuvable.
  </td>
</tr>
</table>

#### Déchiffrement des données

La sécurité du système est primordiale et elle est renforcée par le chiffrement des soumissions de formulaires. Bien que le chiffrement soit effectué en HTTPS, nous avons ajouté une autre couche de sécurité avec le chiffrement AES-256-GSM. Lorsque vous recevrez une soumission de formulaire, elle sera chiffrée et elle comprendra une clé chiffrée, un nonce chiffré et un élément AuthTag chiffré. Ceux-ci peuvent être déchiffrés par l’intermédiaire d’une clé privée.

### **Confirmer** des soumissions de formulaires

L’étape de confirmation permet de s’assurer que les formulaires soumis sont exploitables et s’affichent comme prévu avant qu’ils ne soient définitivement retirés de la base de données du système Formulaires GC. 

##### Demande HTTP

Le chemin d’URL confirme que les soumissions de formulaires ont bien été récupérées à partir du système et les supprime :

<code>
PUT  /forms/{formID}/submission/{submissionName}/confirm/{confirmationCode}
</code>

> _Remarque : La confirmation n’est possible que pour une soumission à la fois, avec un code de confirmation par requête. Le statut de cette soumission passera de « Nouveautés » à « Confirmations ». Il s’agit d’un processus similaire au processus en deux étapes de téléchargement et d’approbation de la suppression dans l’application._

##### Statut de la réponse

<table>
<tr>
  <td><b>Code du statut</b></td> <td><b>Exemple de message</b></td> <td><b>Signification / comment corriger</b></td>
</tr>  
<tr>
  <td><code>200</code></td>
  <td><code>OK</code></td> 
  <td> La soumission a bien été confirmée.</td>
</tr>
<tr>
  <td><code>200</code></td>
  <td>
<code>{
  "info": "Form submission is already confirmed"
}</code> 
  </td> 
  <td> 
  La soumission a déjà été confirmée.
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
  Le code de confirmation fourni ne correspond pas à la soumission à confirmer.
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
  Le renseignement “form ID” ou “Submission name” est incorrect ou introuvable.
  </td>
</tr>
</table>

### Signaler un problème avec la soumission de formulaire

##### Demande HTTP

Ce chemin d’URL identifie une soumission de formulaire comme ayant un problème si un évènement inattendu se produit :

<code>
POST  /forms/{formID}/submission/{submissionName}/problem
</code>

> _Remarque : Le signalement d’un problème n’est possible que pour une seule soumission à la fois. Vous pouvez signaler un problème avec les soumissions de formulaires portant le statut « Nouveautés » ou « Confirmations » tant qu’elles n’ont pas été supprimées du système. Cela changera le statut en « Problème » et bloquera la suppression de la soumission du système jusqu’à ce que le problème soit résolu._

##### Exemple de charge utile pour le signalement d’un problème

Pour signaler un problème, incluez un message au format similaire à celui ci-dessous dans le corps de la requête HTTP POST :

<code>
{
  “contactEmail”: “nom@ministere.gc.ca”,
  “description”: “Voici mon problème”,
  “preferredLanguage”: “fr” (soit “en” ou “fr”)
}
</code>

> _Remarque : Ce message sera transmis à notre équipe de soutien._


##### Statut de la réponse

<table>
<tr>
  <td><b>Code du statut</b></td> <td><b>Exemple de message</b></td> <td><b>Signification / comment corriger</b></td>
</tr>  
<tr>
  <td><code>200</code></td>
  <td><code>OK</code></td> 
  <td> La soumission a bien été signalée comme ayant un problème.</td>
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
  La soumission a déjà été signalée comme ayant un problème.
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
  Détails sur la raison pour laquelle la charge utile fournie n’est pas valide.
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
  Le renseignement “Form ID” ou “Submission name” est incorrect ou n’a pas pu être trouvé.
  </td>
</tr>
</table>

### Obtenir les questions du formulaire

##### Demande HTTP

Ce chemin d’URL récupère les questions qui ont été posées au format JSON afin qu’elles puissent être plus facilement associées aux réponses récupérées :

<code>
GET  /forms/{formID}/template
</code>

> _Remarque : Les questions seront dans une structure de données au format JSON lorsqu’elles seront récupérées. Cela est utile si vous transformez les données et que vous devez faire correspondre les réponses aux questions._

Vous pouvez configurer les attributs des questions avec des **identifiants de question** et des **balises supplémentaires**. Ces deux attributs peuvent être utilisés pour aider à mettre en correspondance les données des réponses aux formulaires avec les systèmes cibles ou les champs de destination dans une base de données. Ceci facilite la mise à jour d'intégrations API avec une manière cohérente de mapper les données des réponses. 

Vous pouvez utiliser ces attributs pour :
- clarifier l'objectif d'un champ
- organiser et trier les données
- soutenir l'automatisation

Pour en savoir plus, voir ci-dessous.

##### Statut de la réponse

<table>
<tr>
  <td><b>Code du statut</b></td> <td><b>Exemple de message</b></td> <td><b>Signification / comment corriger</b></td>
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
  <td>Les données relatives au modèle de formulaire ont bien été récupérées.

</td>
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
  Le renseignement “Form ID” est incorrect ou n’a pas pu être trouvé.
  </td>
</tr>
</table>

#### Pour définir et personnaliser des identifiants de question uniques

L'identifiant de la question est une valeur unique qui vous permet de faire référence de manière cohérente à un élément de formulaire afin qu'il puisse être mis en correspondance avec des versions de formulaire republiées ou d'autres structures et systèmes de données. Il peut s'agir d'un moyen plus facile et plus utile d'identifier et de se référer à un champ de question. Par exemple, une manière standard de se reférer à toutes les questions sur le prénom ou les numéros de téléphone dans tous les formulaires, de sorte qu'ils se retrouvent au bon endroit sans avoir à être tracées individuellement.

**Formulaires GC vous offre la possibilité de configurer un identifiant de question unique :**

1. Créez un nouveau formulaire ou naviguez vers un formulaire existant dans Formulaires GC.
2. Dans « Modifier », sélectionnez une question et cliquez sur « Plus ».
3. Dans la fenêtre modale, faites défiler vers le bas jusqu'à « Personnaliser les attributs de données de l'API ».
4. Modifiez l'identifiant de la question avec une valeur unique de votre choix.

#### Pour étiqueter et organiser les données avec des balises supplémentaires

Les balises supplémentaires sont des étiquettes flexibles qui vous permettent d'ajouter des métadonnées aux éléments du formulaire afin que les questions connexes puissent être marquées, regroupées ou catégorisées, ce qui permet de lire, de rechercher, de trier et d'organiser les données.

**Formulaires GC vous offre la possibilité de configurer plusieurs balises :**

1. Créez un nouveau formulaire ou naviguez vers un formulaire existant dans Formulaires GC.
2. Dans « Modifier », sélectionnez une question et cliquez sur « Plus ».
3. Dans la fenêtre modale, faites défiler vers le bas jusqu'à « Personnaliser les attributs de données de l'API ».
4. Ajoutez plusieurs balises à une question pour marquer les données de manière utile.
