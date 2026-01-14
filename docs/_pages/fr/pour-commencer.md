---
layout: page
title:  "Pour commencer"
lang: fr
permalink: "/pour-commencer/"
trans_url: "/getting-started/"
---

### Survol

Le but de cette API est de récupérer des soumissions de formulaires de manière sécurisée et fiable directement depuis le point de terminaison d’API. Cela devrait alléger la charge de travail associée aux volumes élevés de soumissions de formulaires. Ainsi, plutôt que de télécharger et d’approuver manuellement la suppression des réponses pour confirmer leur récupération à partir de la base de données, l’API automatisera le flux de travail avec des systèmes communiquant entre eux et échangeant des données. 

### Ce dont vous aurez besoin
  - Un [compte Formulaires GC](https://articles.alpha.canada.ca/forms-formulaires/fr)
  - Un formulaire d'ébauche (Non-classifié, Protégé A ou Protégé B)
  - Une clé API (que vous générez dans la section Paramètres > Intégration API)

  - Un formulaire configuré pour « Recevoir les réponses via l'API » dans les paramètres. 
  - Quelques réponses « fictives » soumises dans le formulaire
  - Un système cible dans lequel vous prévoyez de recevoir des données de soumission de formulaire
  - Des ressources de développement d’infrastructure capables de créer des demandes HTTP pour atteindre l’API. _Vous ne disposez d’aucune capacité de développement d’infrastructure? Cette première version de l’API pourrait ne pas être tout à fait prête pour vous._

> **IMPORTANT: Vous devez protéger cette clé API, car elle sert à authentifier les demandes API et pourrait être utilisée pour accéder à des données protégées. Si vous devez communiquer la clé à un·e membre d’une équipe de développement pour configurer l’intégration, utilisez un courriel chiffré.**
