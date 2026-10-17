# Architecture technique du MVP

## Vue d'ensemble
```
 Sources publiques                    Render gratuit (n8n)                     Diffusion
 ─────────────────                    ────────────────────                     ─────────
 RNM FranceAgriMer ──┐               ┌──────────────────────────┐
 Trade Map (export) ─┼──► collecte ─►│ n8n                      │──► Supabase ie (base de prix)
 Eurostat Comext ────┤               │  • déclencheur planifié  │──► Bulletin (Markdown/PDF)
 Veille normes UE ───┘               │  • HTTP / scraping HTML  │──► WhatsApp / e-mail / Substack
                                     │  • nœud OpenRouter (IA)  │
                                     └──────────┬───────────────┘
                                                │
                                     Supabase Postgres (données internes n8n)
                                     cron-job.org (réveil toutes les 10 min)
```

## Composants
| Rôle | Outil | Coût | Remarques |
|---|---|---|---|
| Serveur + HTTPS | Render, Web Service gratuit (`n8n-mmc3.onrender.com`) | 0 € | 512 Mo RAM, disque éphémère, 750 h/mois pour tout le compte : un seul service permanent |
| Orchestration | n8n (Community Edition, image Docker) | 0 € | Workflows planifiés, webhooks, nœud OpenRouter natif |
| Base interne n8n | Supabase Postgres gratuit (Session pooler) | 0 € | 500 Mo ; historique purgé après 7 jours |
| Réveil | cron-job.org → `/healthz` toutes les 10 min | 0 € | Sans lui, Render endort n8n et les déclencheurs planifiés sautent |
| Assistant n8n | Non utilisé | — | Exige un bac à sable Docker, impossible sur Render gratuit (voir guide §5) |
| IA | OpenRouter, modèles `:free` | 0 € | Quotas bas (voir ci-dessous) |
| Données métier | Supabase, schéma `ie` (`infra/supabase/`) | 0 € | Même base que n8n, schéma séparé, non exposé à l'API publique |
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
