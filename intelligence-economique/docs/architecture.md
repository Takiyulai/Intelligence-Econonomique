# Architecture technique du MVP

## Vue d'ensemble
```
 Sources publiques                    Serveur gratuit (Docker)                 Diffusion
 ─────────────────                    ────────────────────────                 ─────────
 RNM FranceAgriMer ──┐               ┌──────────────────────────┐
 Trade Map (export) ─┼──► collecte ─►│ n8n                      │──► Airtable (base de prix)
 Eurostat Comext ────┤               │  • déclencheur planifié  │──► Bulletin (Markdown/PDF)
 Veille normes UE ───┘               │  • HTTP / scraping HTML  │──► WhatsApp / e-mail / Substack
                                     │  • nœud OpenRouter (IA)  │
                                     └──────────┬───────────────┘
                                                │
                                     Postgres (données internes n8n)
                                     Caddy (HTTPS automatique)
```

## Composants
| Rôle | Outil | Coût | Remarques |
|---|---|---|---|
| Serveur | Oracle Cloud « Always Free » (VM ARM) | 0 € | Carte bancaire demandée pour vérification d'identité, pas de débit |
| Orchestration | n8n (Community Edition, Docker) | 0 € | Workflows planifiés, webhooks, nœud OpenRouter natif |
| Base interne n8n | Postgres (Docker) | 0 € | Historique des exécutions, credentials chiffrées |
| HTTPS | Caddy + sous-domaine DuckDNS | 0 € | Certificat Let's Encrypt automatique |
| IA | OpenRouter, modèles `:free` | 0 € | Quotas bas (voir ci-dessous) |
| Données métier | Airtable gratuit | 0 € | Limite d'enregistrements par base ; migrer vers Postgres/NocoDB si dépassée |
| Diffusion pilote | WhatsApp, e-mail, Substack | 0 € | Automatisation WhatsApp officielle (Cloud API) à étudier plus tard |

## Usage d'OpenRouter
- Point d'accès compatible OpenAI : `https://openrouter.ai/api/v1/chat/completions`.
- Dans n8n : nœud **OpenRouter Chat Model** (utilisé par les nœuds *Basic LLM Chain* / *AI Agent*) ou nœud *HTTP Request*.
- Choisir un modèle sur https://openrouter.ai/models en filtrant les modèles gratuits (identifiants terminant par `:free`).
- Quotas indicatifs des modèles gratuits (à revérifier sur la doc OpenRouter) : environ 20 requêtes/minute et
  50 requêtes/jour sans crédit acheté, davantage après un achat unique de crédits. Un bulletin hebdo consomme
  quelques requêtes seulement : largement suffisant pour le pilote.
- Prévoir un modèle de secours (branche d'erreur dans n8n) car un modèle gratuit peut disparaître du jour au lendemain.
- Ne pas envoyer de données personnelles ou confidentielles d'abonnés aux modèles gratuits.

## Tâches confiées à l'IA
1. Nettoyer et structurer des cotations brutes (HTML/CSV) en tableau JSON normalisé.
2. Résumer les variations de prix de la semaine en 5 lignes lisibles par un exportateur.
3. Traduire / vulgariser un texte réglementaire UE en « 5 règles à retenir ».
Les chiffres viennent toujours de la donnée source : l'IA rédige, elle ne calcule pas les prix.
