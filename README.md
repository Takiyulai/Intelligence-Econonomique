# AgroCorridor — Intelligence économique Fruits & Légumes (Afrique de l'Ouest ↔ Europe)

Service d'information commerciale pour les PME agro-exportatrices, coopératives et intermédiaires d'Afrique de l'Ouest :
prix sur les marchés européens, tendances d'importation, alertes réglementaires et mise en relation avec des acheteurs.

## Lancer le site en local
Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.
Dans le dossier du projet (là où se trouve `package.json`) :
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # version de production dans dist/
```
Les prix et alertes affichés sont des **données d'exemple** (signalées dans l'interface). Pour afficher les vraies cotations
de la mangue, copier `.env.example` en `.env.local` (adresse du webhook n8n), voir `n8n/workflows/GUIDE-01-barometre-mangue.md`.

## Pile technique
| Rôle | Outil |
|---|---|
| Site web | Vite, React 19, TypeScript, Tailwind CSS v4, Motion, Recharts |
| Polices | Bricolage Grotesque (titres), Manrope (texte) |
| Automatisation (optionnelle) | n8n sur Render gratuit + base Supabase, voir [infra/n8n/GUIDE-HEBERGEMENT.md](infra/n8n/GUIDE-HEBERGEMENT.md) |
| IA | Modèles gratuits OpenRouter |
| Données (pilote) | Airtable gratuit, à brancher |

## Organisation
```
CLAUDE.md          instructions et garde-fous pour Claude
package.json       dépendances et commandes du site
index.html         page d'entrée
src/               code du site
  components/      sections et éléments d'interface
  services/        accès aux données (seul point à modifier pour brancher une source)
  data/            types et données d'exemple
  hooks/           logique réutilisable (thème clair/sombre)
public/            fichiers statiques (favicon)
docs/              brief, synthèse, architecture, sources, plan de travail
infra/n8n/         hébergement n8n (guide Render + Supabase, variables ; plan B docker-compose)
n8n/workflows/     exports des workflows
prompts/           prompts IA versionnés
data/brut|traite   données sources et nettoyées
livrables/         fiches marché, bulletins, rapports
```
Plan de travail : [docs/plan-de-travail.md](docs/plan-de-travail.md).

## Sécurité
Aucune clé API ni mot de passe dans ce dossier : ils vont dans des fichiers `.env` (ignorés par git) ou dans n8n.
