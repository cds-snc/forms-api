---
layout: page
title:  "Surveiller"
lang: fr
permalink: "/surveiller/"
trans_url: "/monitoring/"
---

### Erreurs courantes

Il s’agit d’erreurs courantes qui s’appliquent généralement et sont les mêmes pour tous les chemins d’URL.

| Code du statut             | Exemple de message | Signification / comment corriger |
| :---------------- | :------ | :---- |
| <code>401</code>       |   <code>Unauthorized</code>   | Aucun jeton d’accès n’a été fourni. |
| <code>401</code>        |   <code>Access token has expired</code>   | Le jeton d’accès a expiré. |
| <code>403</code>   |  <code>Forbidden</code>   | Le jeton d’accès n’a pas pu être validé OU le renseignement “Form ID” est inaccessible avec le jeton d’accès fourni. |
| <code>404</code> |  <code>Not found</code>   | L’URL de requête n’est pas valide. |
| <code>500</code> |  <code>Internal server error</code>   | Une erreur interne est survenue durant le traitement de la requête. |

#### Signalement d'erreurs et retours d'information
Nous nous attendons à ce que des fonctionnalités supplémentaires soient nécessaires pour que les données soient transmises avec succès aux systèmes cibles. Si vous rencontrez une erreur, veuillez soumettre un [ticket de support technique] (https://forms-formulaires.alpha.canada.ca/en/support) et nous travaillerons avec vous pour résoudre le problème. N'hésitez pas à nous faire part de vos commentaires sur la mise en œuvre jusqu'à présent - ce qui fonctionne et ce qui ne fonctionne pas. Vos commentaires contribuent à façonner directement le produit en éclairant nos décisions sur les questions les plus importantes.

### Limite du débit de l'API

Les limitations en matière de requêtes API nous permet de gérer le trafic élevé et de maintenir la stabilité du système. Cela permettra d’éviter les situations de surcharge où trop de demandes sont traitées simultanément. 

La limite des demandes d'API à partir d'un formulaire est de **500 demandes par minute**. Si vous dépassez cette limite, vous obtiendrez une erreur <code>429 RateLimitError</code>. 

| Code du statut             | Exemple de message | Signification / comment corriger |
| :---------------- | :------ | :---- |
| <code>429</code> |  <code>Too many requests</code>   | La limite par défaut est de 500 demandes par 60 secondes. Attendez et réessayez ou demandez une limite plus élevée. |

Vous pouvez voir la **limite actuelle de demandes** dans <code>X-RateLimit-Limit</code>, le nombre de **demandes restantes** dans <code>X-RateLimit-Remaining</code>, et le **moment de réinitialisation de la limite** dans <code>X-RateLimit-Reset</code>.

À l'avenir, nous prévoyons que les limites d’API seront liées à différents cas d’utilisation ou types d’utilisation et nous essaierons de déterminer les limites appropriées par minute pour les demandes d’API.

Dans l'intervalle, si vous avez besoin d'une augmentation du nombre de requêtes API, [contactez l'équipe de soutien](https://forms-formulaires.alpha.canada.ca/fr/support).

### Actualisation des clés API

L’actualisation d’une clé API peut devenir nécessaire si une clé est compromise. Les clés peuvent être révoquées et régénérées, ce qui nécessite simplement une modification des paramètres demandés dans la demande.


