# Workflows n8n

Exports JSON des workflows (menu du workflow → *Download*). Les exports ne contiennent pas les clés : les credentials
restent dans n8n et doivent être re-sélectionnées après un import.

| Fichier | Rôle | Déclencheur | Statut |
|---|---|---|---|
| `01_barometre-mangue.json` | Saisie des cotations RNM (formulaire) → Supabase → commentaire IA ; API lue par le site. Guide : [GUIDE-01-barometre-mangue.md](GUIDE-01-barometre-mangue.md) | Formulaire + GET | Prêt, testé en local |
| `02_bulletin-hebdo.json` | Génère le bulletin de la semaine à partir de Supabase | Vendredi, après 01 | À créer (phase 3) |
| `03_alertes-normes.json` | Surveille les changements réglementaires UE et alerte | Quotidien | Phase 5 |
