# CLAUDE.md

Plateforme B2B d'intelligence économique : prix, volumes et normes pour les exportateurs de fruits et légumes
d'Afrique de l'Ouest vers l'Europe. Contexte détaillé : `docs/` (ne le relire que si la tâche l'exige).

## Stack
- Site (à la racine) : Vite + React 19 + TypeScript + Tailwind CSS v4 + Motion (animations) + Recharts + lucide-react.
  Polices : Bricolage Grotesque (titres, `font-display`) et Manrope (texte, `font-sans`), via Fontsource.
- Données : `src/services/` est la seule porte d'entrée. Mangue : webhook n8n si `VITE_N8N_BAROMETRE_URL` est défini
  (repli automatique sur les données d'exemple) ; base métier dans Supabase, schéma `ie`. Les composants ne savent pas d'où viennent les données.
- Automatisation : n8n sur Render gratuit (`n8n-mmc3.onrender.com`) + base Supabase + cron de réveil (`infra/n8n/`),
  **optionnel**. L'application doit fonctionner sans. Pas d'Assistant n8n (bac à sable impossible sur Render gratuit).
- IA : modèles gratuits OpenRouter (`:free`). Pas de GPT ni Claude payants sans accord du porteur.

## Commandes (à la racine)
`npm install` · `npm run dev` · `npm run build` (vérifie les types) · `npm run preview`

## Garde-fous
1. **Aucun secret** dans le code ou les docs : clés et mots de passe uniquement dans des `.env` ignorés par git.
   Côté navigateur, ne jamais exposer une clé privée (variables `VITE_*` = publiques).
2. **Aucun chiffre inventé présenté comme réel.** Toute donnée d'exemple est marquée « exemple » dans l'UI ;
   toute donnée réelle cite sa source et sa date.
3. Pas de nouvel outil payant ni de nouvelle dépendance lourde sans accord. Préférer le CSS et Motion déjà présents.
4. Ne jamais envoyer de données d'abonnés à un modèle IA gratuit.
5. Ne pas supprimer ni déplacer `docs/brief/` ni `data/brut/` (sources originales).
6. `npm run build` doit passer avant de considérer une tâche terminée.

## Design (à respecter partout)
Moderne et épuré ; responsive mobile d'abord ; mode clair/sombre (classe `dark` sur `<html>`, tokens dans
`src/index.css`) ; 3D légère (inclinaison ≤ 8°), parallaxe douce, micro-interactions courtes (≤ 300 ms) ;
respecter `prefers-reduced-motion` ; contraste AA ; navigation clavier visible.

## Conventions
- Français partout (UI, docs, commits). Composants en PascalCase, un par fichier dans `src/components/`.
- Données brutes : `data/brut/<source>_<produit>_<AAAA-MM-JJ>.<ext>` ; livrables dans `livrables/`.
- Workflows n8n exportés (sans credentials) dans `n8n/workflows/` ; prompts IA dans `prompts/`.
