# Sources de données

Statut : à valider pendant la phase 1 (accès, format exact, conditions de réutilisation).

| Source | Accès | Fréquence | Méthode de collecte envisagée |
|---|---|---|---|
| **RNM – FranceAgriMer** (rnm.franceagrimer.fr) | Public, pages web de cotations | Hebdo (vendredi) | n8n : *HTTP Request* + *HTML Extract*, puis structuration par l'IA |
| **Trade Map (ITC)** (trademap.org) | Compte gratuit, export Excel manuel | Trimestriel | Téléchargement manuel → `data/brut/`, import dans Airtable via n8n |
| **Eurostat Comext** (complément proposé) | API publique gratuite, sans clé | Mensuel | n8n : *HTTP Request* sur l'API pour automatiser les importations UE depuis la CEDEAO par code SH |
| **Global Trade Helpdesk** (globaltradehelpdesk.org) | Public, pas d'API | Ponctuel | Lecture manuelle pour les fiches marché |
| **Veille normes UE** (complément proposé) : base LMR pesticides de l'UE, RASFF, Access2Markets | Public | Quotidien | n8n : surveillance de pages/flux, alerte si changement |
| **MANSA (Afreximbank)** | Inscription requise | Ponctuel | Manuel, pour la qualification des partenaires (phase intermédiation) |

## Codes SH utiles (à confirmer)
- Mangues, goyaves, mangoustans : 0804 50
- Piments (Capsicum) frais : 0709 60
- Ananas : 0804 30

## Règles
- Respecter les conditions d'utilisation de chaque site ; espacer les requêtes ; préférer API et exports officiels au scraping.
- Conserver la donnée brute datée dans `data/brut/` avant toute transformation.
