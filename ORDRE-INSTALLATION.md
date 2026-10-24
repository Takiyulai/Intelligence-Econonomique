# Ordre d'installation (à suivre de haut en bas)

Tous les fichiers sont dans `C:\Users\MP-PC\Downloads\IT`. Cochez au fur et à mesure ; une étape déjà faite se saute.

## A. Supabase : créer les tables (SQL Editor → New query → coller le contenu du fichier → Run)
Ouvrir chaque fichier avec le Bloc-notes (clic droit → Ouvrir avec → Bloc-notes), tout sélectionner (Ctrl+A), copier, coller dans Supabase.

| # | Fichier | Crée | Fait ? |
|---|---|---|---|
| A1 | `infra\supabase\01_cotations.sql` | le schéma `ie`, `cotations`, `syntheses` | ☐ |
| A2 | `infra\supabase\02_abonnes.sql` | `abonnes` | ☐ |
| A3 | `infra\supabase\03_flux_commerce.sql` | `flux_commerce`, `infos_manuelles`, `syntheses_commerce` | ☐ |
| A4 | `infra\supabase\04_conformite.sql` | `alertes_conformite`, `lmr`, `journal_collectes` | ☑ (26/10) |

Vérifier : Supabase → **Table Editor** → menu *schema* → **ie** : les 9 tables apparaissent.
Les fichiers `.json` ne vont **jamais** dans Supabase.

## B. Credentials dans n8n (une seule fois, menu **Credentials → Create**)
| # | Credential | Nom à lui donner | Guide |
|---|---|---|---|
| B1 | Postgres (connexion Supabase, pooler, utilisateur `postgres.<ref>`) | `Supabase IE` | GUIDE-01 |
| B2 | OpenRouter (clé API) | `OpenRouter` | GUIDE-01 |
| B3 | Basic Auth (mot de passe du formulaire) | `Formulaire IE` | GUIDE-01 |
| B4 | Header Auth : `Authorization` = `Bearer re_…` | `Resend` | GUIDE-02 |
| B5 | Google Sheets OAuth2 | (nom libre) | GUIDE-03 |

## C. n8n : importer les workflows (Create workflow → ⋯ → Import from File…)
Les fichiers sont dans `n8n\workflows\`. Après chaque import : choisir les credentials sur les nœuds marqués d'un triangle, **Save**, tester, puis **Publish**.

| # | Fichier | À régler après l'import | Guide |
|---|---|---|---|
| C1 | `01_barometre-mangue.json` | credentials | `GUIDE-01-barometre-mangue.md` |
| C2 | `02_bulletin-abonnes.json` | credentials + votre e-mail dans *Préparer les envois* | `GUIDE-02-bulletin-abonnes.md` |
| C3 | `03_donnees-commerce.json` | credentials + adresse du Google Sheet (2 nœuds) | `GUIDE-03-donnees-commerce.md` |
| C4 | `04_veille-conformite.json` | credentials + adresse du Sheet + votre e-mail (2 nœuds) + `PAGES = 120` au 1er test | `GUIDE-04-veille-conformite.md` |

Si le workflow 02 était déjà importé avant le 26/10 : le réimporter (nouvelle version avec la rubrique conformité).

## D. Google Sheet (pour C3 et C4)
Importer `n8n\workflows\modele-google-sheet-03.xlsx` dans Google Drive, l'ouvrir avec Google Sheets.
Il contient les 3 onglets attendus : **cotations**, **infos**, **alertes**. Copier son adresse pour les nœuds Google Sheets.

## E. Site
`.env.local` : `VITE_N8N_BAROMETRE_URL=https://dramanetaki.app.n8n.cloud/webhook/barometre-mangue` (déjà en place).
Puis `npm run dev`. Les alertes du workflow 04 s'affichent toutes seules.
