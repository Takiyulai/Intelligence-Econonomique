# Workflow 03 : données commerce automatiques (APIs + Google Sheet)

Fichier à importer : [`03_donnees-commerce.json`](03_donnees-commerce.json). Il suppose le workflow 01 en place (même credential `Supabase IE`).
Modèle de Google Sheet : [`modele-google-sheet-03.xlsx`](modele-google-sheet-03.xlsx).

## Pourquoi pas Trade Map directement
Trade Map (ITC) n'a pas d'API publique, ses conditions d'utilisation interdisent l'extraction automatique, et le site exige une
connexion. Le workflow va donc chercher les mêmes chiffres à la source, gratuitement :

| Source | Ce qu'on récupère | Rythme | Clé |
|---|---|---|---|
| **Eurostat Comext** (DS-045409) | Importations de mangues (CN 08045000) en **France** et dans l'**UE**, depuis la Côte d'Ivoire et le Sénégal : valeur en €, poids | Mensuel, environ 2 mois de retard | Aucune |
| **UN Comtrade** (aperçu public) | Exportations de mangues (SH 080450) de la **Côte d'Ivoire** et du **Sénégal**, par pays de destination, en $ | Annuel (3 dernières années) | Aucune |
| **Votre Google Sheet** | Cotations RNM de la semaine (remplace le formulaire) et infos que seul Trade Map ou le terrain donne | Lu chaque vendredi | Connexion Google |

## Ce que fait le workflow
```
① Le 20 de chaque mois, 7 h (ou bouton « Lancer à la main »)
   Eurostat Comext ─► UN Comtrade ─► ie.flux_commerce ─► note IA du mois ─► ie.syntheses_commerce

② Chaque vendredi, 7 h (avant le bulletin de 8 h)
   Onglet « cotations » ─► ie.cotations ─► Onglet « infos » ─► ie.infos_manuelles ─► commentaire IA de la semaine ─► ie.syntheses
```
Si une source ne répond pas, le workflow continue avec les autres. L'IA ne calcule rien : les tonnages, valeurs et €/kg
sont calculés dans le nœud *Préparer la note du mois*, l'IA rédige seulement 4 phrases.

## Étape 1 : créer les tables dans Supabase
Supabase → **SQL Editor** → coller [`infra/supabase/03_flux_commerce.sql`](../../infra/supabase/03_flux_commerce.sql) → **Run**.
Résultat attendu : « Success. No rows returned ». Schéma **ie** : nouvelles tables `flux_commerce`, `infos_manuelles`, `syntheses_commerce`.

## Étape 2 : préparer le Google Sheet
1. Google Drive → **Nouveau → Importer un fichier** → `modele-google-sheet-03.xlsx`, puis ouvrir avec Google Sheets
   (ou **Fichier → Enregistrer au format Google Sheets**).
2. Garder exactement les noms d'onglets **cotations** et **infos** et la 1re ligne (titres des colonnes). Supprimer les lignes d'exemple quand vous voulez.
3. Copier l'adresse du fichier (barre du navigateur, `https://docs.google.com/spreadsheets/d/…/edit`).

Comment remplir :
- **cotations** : une ligne par prix relevé sur le RNM. `date` au format `2026-10-09` ou `09/10/2026`, prix avec virgule ou point.
  Une ligne fausse (prix min > max, date manquante) est simplement ignorée : le détail apparaît dans la sortie du nœud *Préparer les cotations*.
- **infos** : tout ce que vous trouvez à la main. Pour Trade Map : `categorie` = `trade map`, un `titre` court, les chiffres
  clés dans `detail` ou `valeur` + `unite`. Les 10 dernières infos de moins de 45 jours sont données à l'IA pour la note du mois.
  Modifier une ligne met à jour la même info (tant que date, titre, pays et source ne changent pas).

## Étape 3 : importer dans n8n
1. **Create credential → Google Sheets OAuth2 API** → *Sign in with Google* → choisir votre compte. (Sur n8n Cloud, c'est un clic.)
2. Importer `03_donnees-commerce.json` (menu **⋯ → Import from File…**).
3. Choisir les credentials sur les nœuds marqués d'un triangle :
   - les 8 nœuds Postgres → `Supabase IE` ;
   - `OpenRouter (mensuel)` et `OpenRouter (hebdo)` → `OpenRouter` ;
   - `Lire l'onglet cotations` et `Lire l'onglet infos` → votre credential Google Sheets, et **coller l'adresse du Sheet**
     dans *Document* (à la place de `A_REMPLACER`).
4. **Save**, puis **Publish** (interrupteur *Active*).

## Étape 4 : tester la partie mensuelle
Cliquer **Execute workflow** (bouton *Lancer à la main*). **Résultat attendu** :
- `Lire Comext` : un objet `lignes` avec plusieurs dizaines de mois (FR et EU27_2020 × CI et SN) ;
- `Lire Comtrade` : des lignes CIV et SEN par destination ;
- Supabase → `ie.flux_commerce` rempli, `ie.syntheses_commerce` : une note pour le dernier mois disponible.

Si `Lire Comext` ou `Lire Comtrade` affiche un champ `erreur`, ouvrez le nœud HTTP juste avant pour voir la réponse.
Vous pouvez aussi coller l'adresse du nœud *Eurostat Comext* dans votre navigateur : vous devez voir du JSON commençant par `{"version":"2.0"`.
Comtrade, sans clé, limite le nombre d'appels : en cas de refus, relancer plus tard. Pour lever la limite, créer une clé gratuite sur
https://comtradedeveloper.un.org et me la confier.

## Étape 5 : tester la partie Google Sheet
Ajouter une ligne dans l'onglet *cotations*, puis dans n8n survoler le déclencheur *Chaque vendredi 7 h* et cliquer sur ▶.
**Résultat attendu** : `Enregistrer les cotations` renvoie `cotations_enregistrees` ≥ 1, une ligne apparaît dans `ie.cotations`,
et `ie.syntheses` reçoit le commentaire de la semaine. Le bulletin du vendredi (workflow 02) l'utilisera à 8 h.

Le formulaire du workflow 01 reste utilisable en dépannage : les deux écrivent dans la même table, sans doublon.

## Élargir plus tard
- Autres produits : changer `product=08045000` (Comext, CN8) et `cmdCode=080450` (Comtrade, SH6), ex. piment `07096010` / `070960`.
- Autres pays : ajouter `&partner=ML&partner=BF` (Comext) et les codes M49 dans `reporterCode` (Comtrade : Mali 466, Burkina Faso 854).
- Droits de douane (WITS / Market Access Map) : quasi fixes, une saisie dans l'onglet *infos* suffit.
