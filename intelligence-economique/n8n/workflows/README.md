# Workflows n8n

Exports JSON des workflows (menu du workflow → *Download*). Les exports ne contiennent pas les clés : les credentials
restent dans n8n et doivent être re-sélectionnées après un import.

| Fichier | Rôle | Déclencheur | Statut |
|---|---|---|---|
| `01_cotations-rnm-hebdo.json` | Récupère les cotations RNM, les structure via OpenRouter, les enregistre dans Airtable | Vendredi | À créer (phase 3) |
| `02_bulletin-hebdo.json` | Génère le bulletin de la semaine à partir d'Airtable | Vendredi, après 01 | À créer (phase 3) |
| `03_alertes-normes.json` | Surveille les changements réglementaires UE et alerte | Quotidien | Phase 5 |
