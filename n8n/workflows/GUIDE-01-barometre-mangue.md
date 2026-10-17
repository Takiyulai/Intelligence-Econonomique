# Workflow 01 : baromètre mangue, pas à pas

Produit pilote retenu par défaut : **mangue de Côte d'Ivoire et du Sénégal vendue en France** (prix grossiste RNM, Rungis).
Fichier à importer : [`01_barometre-mangue.json`](01_barometre-mangue.json).

## Ce que fait le workflow
```
① Saisie (chaque vendredi)
   Formulaire protégé ─► Contrôle des prix ─► Supabase ie.cotations ─► Série hebdo ─► IA OpenRouter ─► Supabase ie.syntheses

② API lue par le site
   GET /webhook/barometre-mangue ─► Série des 12 dernières semaines + commentaire ─► JSON pour le baromètre du site
```
L'IA ne calcule rien : la moyenne vient de la base, l'IA écrit seulement 3 phrases de lecture.

## Outils externes
| Outil | Rôle ici | Statut |
|---|---|---|
| n8n (Render) | Exécute le workflow | Déjà en place |
| Supabase | Stocke les cotations et les commentaires (schéma `ie`, séparé des tables de n8n) | Déjà en place, 1 script SQL à lancer |
| OpenRouter | Modèle gratuit qui rédige le commentaire | Déjà en place (clé) |
| cron-job.org | Garde n8n éveillé | Déjà en place |

Pas nécessaires pour ce workflow :
- **Airtable** : remplacé par Supabase, qui est déjà là (un compte de moins).
- **Google Drive** : utile plus tard pour archiver les bulletins PDF (workflow 02).
- **NotebookLM** : n'a pas d'API publique, n8n ne peut pas s'y connecter. Il reste utile à la main pour lire
  des textes réglementaires longs (alertes normes).

## Étape 1 : créer les tables dans Supabase
Supabase → **SQL Editor** → *New query* → coller [`infra/supabase/01_cotations.sql`](../../infra/supabase/01_cotations.sql) → **Run**.
Résultat attendu : « Success. No rows returned ». Dans *Table Editor*, choisir le schéma **ie** : tables `cotations` et `syntheses`, vides.

## Étape 2 : créer les 3 credentials dans n8n
n8n → **Overview → Create → Credential** (ou bouton *Create credential* d'un nœud).
1. **Postgres**, nommé `Supabase IE` : mêmes informations que n8n utilise déjà (Supabase → *Connect* → *Session pooler*) :
   Host `aws-0-<région>.pooler.supabase.com`, Database `postgres`, User `postgres.<ref>`, Password, Port `5432`,
   SSL **Require**, *Ignore SSL Issues* activé. Cliquer **Save** : n8n doit afficher « Connection tested successfully ».
2. **OpenRouter** : celle déjà créée (sinon *OpenRouter* + votre clé).
3. **Basic Auth**, nommé `Formulaire IE` : choisissez un identifiant et un mot de passe. Ils protègent le formulaire de saisie.

## Étape 3 : importer le workflow
1. n8n → **Overview → Create → Workflow**, puis menu **⋯ (en haut à droite) → Import from File…** → choisir `01_barometre-mangue.json`.
2. Ouvrir chaque nœud marqué d'un triangle et choisir la credential :
   - `Formulaire cotation` → Authentication *Basic Auth* → `Formulaire IE`
   - `Enregistrer dans Supabase`, `Lire la série`, `Enregistrer le commentaire`, `Lire la série (API)` → `Supabase IE`
   - `OpenRouter (modèle gratuit)` → `OpenRouter`
3. **Save**, puis **Publish** (ou interrupteur *Active*) pour activer les adresses de production.

Pour le construire à la main plutôt que l'importer, recréer les nœuds dans cet ordre : *n8n Form Trigger* → *Code* →
*Postgres (Execute Query)* → *Postgres (Execute Query)* → *Code* → *Basic LLM Chain* + *OpenRouter Chat Model* →
*Postgres (Execute Query)* ; puis *Webhook (GET)* → *Postgres* → *Code* → *Respond to Webhook*. Le code et les requêtes
de chaque nœud sont dans le JSON (ouvrez-le dans un éditeur de texte).

## Étape 4 : tester la saisie
1. Ouvrir le nœud `Formulaire cotation` → onglet **Production URL** → ouvrir l'adresse
   (`https://n8n-mmc3.onrender.com/form/…`) → saisir l'identifiant `Formulaire IE`.
2. Remplir un exemple réel relevé sur https://rnm.franceagrimer.fr (rechercher « mangue », marché de Rungis, stade grossiste),
   ou pour un premier essai : date `2026-10-09`, Rungis, Côte d'Ivoire, Kent, min `2.20`, max `2.60`, source `RNM FranceAgriMer`.
3. **Résultat attendu** :
   - la page affiche « Cotation enregistrée. Le commentaire IA sera mis à jour d'ici une minute. » ;
   - n8n → **Executions** : une exécution *Succeeded*, 7 nœuds verts ;
   - Supabase → Table Editor → schéma `ie` → `cotations` : une ligne avec `prix_moyen = 2.40` ;
   - `syntheses` : une ligne pour la semaine `2026-41` avec 1 à 3 phrases en français.
4. Saisir une deuxième cotation sur une autre semaine (ex. `2026-10-02`, min `2.10`, max `2.50`) pour voir une tendance.
   Un prix minimum supérieur au maximum est refusé (exécution en erreur, rien n'est enregistré).

## Étape 5 : tester l'API
Ouvrir dans le navigateur `https://n8n-mmc3.onrender.com/webhook/barometre-mangue`. **Résultat attendu** (avec les deux saisies ci-dessus) :
```json
{"produit":"mangue","marche":"Rungis","unite":"€/kg","source":"RNM FranceAgriMer, cotations grossistes saisies chaque semaine",
 "points":[{"semaine":"S40","prix":2.3},{"semaine":"S41","prix":2.4}],
 "commentaire":"…3 phrases rédigées par l'IA…","majLe":"2026-10-09","exemple":false}
```

## Étape 6 : brancher le site
1. À la racine du projet (dossier IT), copier `.env.example` en **`.env.local`** (il contient déjà la bonne adresse).
2. `npm run dev` puis ouvrir http://localhost:5173.
3. **Résultat attendu** : dans le baromètre (onglet Mangue) et dans la carte du haut de page, le badge devient
   **« Cotations réelles · 9 oct. 2026 »**, la courbe montre vos semaines et le bloc « Lecture de la semaine » affiche le commentaire IA.
   Sans `.env.local`, ou si n8n ne répond pas en 10 s, le site revient tout seul aux données d'exemple.

## En cas de problème
- **Le formulaire demande sans cesse le mot de passe** : identifiant de la credential `Formulaire IE`.
- **Erreur sur un nœud Postgres** : la credential `Supabase IE` (pooler, port 5432, SSL Require), ou le script SQL de l'étape 1 n'a pas été lancé.
- **Pas de commentaire** (nœud `Rédiger le commentaire` en erreur) : quota du modèle gratuit atteint. La cotation est quand même
  enregistrée ; la saisie suivante régénère le commentaire.
- **Le site reste sur « Données d'exemple »** : le workflow n'est pas publié, `.env.local` est absent, ou la base ne contient aucune cotation.
  Redémarrer `npm run dev` après avoir créé `.env.local`.

## Ce qui a été vérifié
Le workflow a été importé et exécuté dans un n8n 2.43 de test avec une base Postgres locale et un faux modèle IA :
formulaire protégé (401 sans mot de passe), contrôle min/max, enregistrement, calcul de la moyenne hebdo, commentaire enregistré,
réponse JSON de l'API avec l'en-tête CORS. Le site a été compilé (`npm run build`) et affiché branché sur cette API.
Non vérifié ici : la connexion à votre Supabase et à OpenRouter réels.
