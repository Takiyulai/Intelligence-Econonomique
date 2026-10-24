# Workflow 04 : veille conformité (RASFF + LMR + interceptions)

Fichier à importer : [`04_veille-conformite.json`](04_veille-conformite.json). Il suppose les workflows 01, 02 et 03 en place
(mêmes credentials `Supabase IE`, `OpenRouter`, `Resend`, `Google Sheets`, même Google Sheet).

## Ce que fait le workflow
```
① Chaque lundi 6 h (Abidjan)
   RASFF (alertes sanitaires UE) ─► origines d'Afrique de l'Ouest seulement ─► ie.alertes_conformite
   Onglet « alertes » du Sheet (interceptions EUROPHYT relevées à la main) ─► même table
   Nouvelles alertes ─► titres traduits en français par l'IA ─► e-mail récapitulatif pour vous

② Le 2 de chaque mois
   Base pesticides de l'UE ─► LMR de la mangue ─► ie.lmr ─► si une LMR change : alerte + e-mail

③ API publique GET /webhook/conformite-mangue
   Feu vert / orange / rouge par pays d'origine + 6 dernières alertes ─► section « Alertes » du site
```
Le bulletin du vendredi (workflow 02) ajoute une rubrique **Conformité UE · mangue** dès que ce workflow a tourné une fois.

Pourquoi deux sources : le **RASFF** recense les risques alimentaires (pesticides, aflatoxines, salmonelle). Pour la mangue
fraîche, le risque principal est la **mouche des fruits**, recensée dans **EUROPHYT / TRACES**, qui ne publie plus de fichier
téléchargeable depuis 2022 (seulement un tableau de bord). Ces interceptions se saisissent donc à la main dans le Sheet.

**À savoir** : l'interface du RASFF utilisée ici est celle qu'emploie le site public du RASFF ; elle n'est pas documentée
officiellement et peut changer. Les données sont publiques et réutilisables en citant la Commission européenne.
Je n'ai pas pu tester ces adresses depuis mon environnement (réseau bloqué) : l'étape 5 sert à le vérifier.

## Étape 1 : créer les tables dans Supabase (2 min)
Supabase → **SQL Editor** → **New query** → coller tout [`infra/supabase/04_conformite.sql`](../../infra/supabase/04_conformite.sql) → **Run**.
Résultat attendu : « Success. No rows returned ». Schéma **ie** : nouvelles tables `alertes_conformite`, `lmr`, `journal_collectes`.

## Étape 2 : ajouter l'onglet « alertes » à votre Google Sheet (2 min)
1. Ouvrez le Google Sheet du workflow 03 → **+** en bas à gauche → renommez l'onglet exactement **alertes**.
2. En ligne 1, tapez ces 9 titres, un par colonne de A à I :
   `date` · `source` · `produit` · `pays` · `danger` · `decision` · `titre` · `detail` · `lien`
   (ou copiez l'onglet *alertes* du fichier [`modele-google-sheet-03.xlsx`](modele-google-sheet-03.xlsx), qui contient 2 lignes d'exemple à supprimer).

Comment remplir une ligne :
| Colonne | Exemple | Règle |
|---|---|---|
| date | `2026-10-15` ou `15/10/2026` | obligatoire |
| source | `EUROPHYT` | `EUROPHYT` ou `TRACES`, `AGRINFO`, sinon ce que vous voulez |
| produit | `mangue` | vide = mangue |
| pays | `Côte d'Ivoire` ou `CI` | pays d'origine |
| danger | `organismes nuisibles` | vide = deviné (mouches des fruits pour EUROPHYT) |
| decision | `interception` | facultatif |
| titre | `Mouches des fruits sur mangues` | obligatoire, en français |
| detail, lien | | facultatifs |

Où trouver les interceptions : tableau de bord des interceptions sur
https://food.ec.europa.eu/plants/plant-health-and-biosecurity/europhyt/interceptions_en (mis à jour le 6 et le 21 du mois),
ou les rapports mensuels d'AGRINFO (agrinfo.eu, rubrique « Plant health interceptions »). 10 minutes par mois suffisent.

## Étape 3 : importer dans n8n (5 min)
1. n8n → **Create workflow** → menu **⋯ → Import from File…** → `04_veille-conformite.json`.
2. Choisir les credentials sur les nœuds marqués d'un triangle :
   - les 5 nœuds Postgres (*Enregistrer…*, *Lire la conformité*) → `Supabase IE` ;
   - *Lire l'onglet alertes* → votre credential Google Sheets, puis **coller l'adresse de votre Sheet** dans *Document*
     (à la place de `A_REMPLACER`) ;
   - *OpenRouter (traduction)* → `OpenRouter` ;
   - *Envoyer l'e-mail* et *Envoyer l'e-mail LMR* → `Resend`.
3. Ouvrir **Préparer l'e-mail** et **E-mail si LMR modifiée** : remplacer `a-remplacer@exemple.com` par votre e-mail
   (même valeur que `ADMIN` dans le workflow 02), et l'expéditeur si votre domaine est vérifié sur Resend.
4. Ouvrir **Pages RASFF** : mettre `const PAGES = 120;` pour ce premier lancement (environ un an d'historique).
5. **Save**.

## Étape 4 : réimporter le workflow 02 (3 min)
Le bulletin du vendredi a un nouveau nœud *Lire les alertes*. Ouvrez votre workflow 02 → menu **⋯ → Import from File…** →
[`02_bulletin-abonnes.json`](02_bulletin-abonnes.json) (cela remplace son contenu). Puis, comme la première fois :
`Supabase IE` sur les 3 nœuds Postgres, `Resend` sur *Envoyer avec Resend*, et vos valeurs `ADMIN` / `EXPEDITEUR` en haut de
*Préparer les envois*. **Save**. Tant que le 04 n'a jamais tourné, le bulletin reste identique à avant.

## Étape 5 : premier test (10 min)
Dans le workflow 04, cliquer **Execute workflow** (déclencheur *Lancer à la main* : il lance le RASFF et les LMR).
Avec 120 pages, la partie RASFF prend environ 3 minutes.

**Résultat attendu**
- *Lire RASFF* : `recues` de plusieurs milliers, `afrique_ouest` de quelques dizaines à quelques centaines, `periode_lue`
  couvrant à peu près l'année écoulée, `erreur` vide.
- *Enregistrer RASFF* : `nb_nouvelles` > 0. Supabase → `ie.alertes_conformite` rempli.
- Vous recevez un e-mail « [Veille conformité] … nouvelle(s) alerte(s) » (long la première fois, c'est normal).
- *Préparer les LMR* : une liste `lignes` de plusieurs centaines de substances, `erreur` vide. Supabase → `ie.lmr` rempli.
  Pas d'e-mail LMR la première fois : on enregistre seulement les valeurs de départ.
- Ouvrez `https://dramanetaki.app.n8n.cloud/webhook/conformite-mangue` une fois le workflow publié (étape 6) :
  vous devez voir du JSON commençant par `{"feux":[`.

Puis remettez `const PAGES = 4;` dans *Pages RASFF* et **Save**.

**Si quelque chose bloque**, regardez le champ `erreur` du nœud indiqué et envoyez-moi une capture :
| Symptôme | Cause probable | Que faire |
|---|---|---|
| *Lire RASFF* : « aucune notification lue » | le RASFF a changé de format ou refuse la requête | ouvrir le nœud *RASFF* → onglet *Output* → m'envoyer une capture de la réponse |
| `recues` > 0 mais `afrique_ouest` = 0 | les pays d'origine sont dans un champ que le code ne connaît pas | m'envoyer une capture d'une notification dans la sortie de *RASFF* |
| `periode_lue` ne couvre que quelques jours avec 120 pages | le RASFF ne trie pas du plus récent au plus ancien | me le signaler, j'ajouterai un filtre par date |
| *Préparer les LMR* : « mangue introuvable » ou « aucune valeur lue » | adresse ou format de l'API pesticides différent | m'envoyer une capture de la sortie de *Produits (base pesticides UE)* |
| Le Sheet : « Onglet alertes illisible » | onglet absent ou mal nommé | vérifier l'étape 2 (nom exact **alertes**) |

Chaque exécution laisse aussi une ligne dans `ie.journal_collectes` (source, lignes reçues, nouvelles, erreur) :
c'est là qu'on voit si une source se met à échouer.

## Étape 6 : activer
Workflow 04 → **Publish** (interrupteur *Active*). Ensuite tout est automatique : le lundi à 6 h pour les alertes, le 2 du
mois pour les LMR. Le site (même adresse n8n que le baromètre) affiche les feux tout seul : rien à changer dans `.env.local`.
Pour voir le résultat en local : `npm run dev`, section **Alertes**.

## Réglages utiles
- **Pays suivis et seuils du feu** : en haut du nœud *Format du site* (`PAYS_SUIVIS`, rouge à partir de 3 alertes sur
  90 jours, orange à partir d'une alerte sur 12 mois).
- **Produits repérés** : la mangue, le piment et l'ananas sont détectés dans les titres anglais du RASFF (nœud *Lire RASFF*,
  fonction `produit`). Les autres produits d'Afrique de l'Ouest (sésame, arachide…) sont gardés en base sous `autre`.
- **Traduction** : au plus 40 titres par exécution (`MAX_TRADUITES` dans *Nouvelles alertes*). Si le modèle gratuit ne répond
  pas, le titre anglais est conservé.
