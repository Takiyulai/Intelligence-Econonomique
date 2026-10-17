# AgroCorridor — Intelligence économique Fruits & Légumes (Afrique de l'Ouest ↔ Europe)

Service d'information commerciale pour les PME agro-exportatrices, coopératives et intermédiaires d'Afrique de l'Ouest :
prix sur les marchés européens, tendances d'importation, alertes réglementaires et mise en relation avec des acheteurs.

## Lancer le site en local
Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.
```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm run build      # version de production dans web/dist
```
Les prix et alertes affichés sont des **données d'exemple** (signalées dans l'interface) tant qu'aucune source réelle
n'est branchée dans `web/src/services/marketData.ts`.

## Pile technique
| Rôle | Outil |
|---|---|
| Site web | Vite, React 19, TypeScript, Tailwind CSS v4, Motion, Recharts |
| Automatisation (optionnelle) | n8n auto-hébergé, voir [infra/n8n/GUIDE-HEBERGEMENT.md](infra/n8n/GUIDE-HEBERGEMENT.md) |
| IA | Modèles gratuits OpenRouter |
| Données (pilote) | Airtable gratuit, à brancher |

## Organisation
```
CLAUDE.md          instructions et garde-fous pour Claude
docs/              brief, synthèse, architecture, sources, plan de travail
web/               application web (src/components, src/services, src/data)
infra/n8n/         hébergement n8n (docker-compose, Caddy, guide)
n8n/workflows/     exports des workflows
prompts/           prompts IA versionnés
data/brut|traite   données sources et nettoyées
livrables/         fiches marché, bulletins, rapports
```
Plan de travail : [docs/plan-de-travail.md](docs/plan-de-travail.md).

## Sécurité
Aucune clé API ni mot de passe dans ce dossier : ils vont dans des fichiers `.env` (ignorés par git) ou dans n8n.
