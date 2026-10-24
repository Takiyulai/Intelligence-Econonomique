# Collecte automatique : faut-il scraper, source par source ?

Date : 2026-10-26. Proposition, rien n'est implémenté.

## Réponse courte
Le vrai scraping (lire des pages HTML) n'est utile que pour **une seule source : les prix RNM**. Pour la conformité, le RASFF
a une interface JSON publique (non documentée) et la base LMR de l'UE a des exports et des API officiels. EUROPHYT ne
publie plus de fichiers depuis 2022 : on la suit à la main. Tout se fait dans n8n, sans Python ni nouveau serveur.

## Source par source

| Source | Ce qu'elle apporte | Accès réel | Scraping ? | Méthode proposée |
|---|---|---|---|---|
| Eurostat Comext, UN Comtrade | Volumes et valeurs | API | Non | Déjà fait (workflow 03) |
| **RASFF Window** | Alertes sanitaires UE (pesticides, aflatoxines…) | Le portail public interroge une interface JSON sans connexion (`POST …/rasff-window/backend/public/notification/search/consolidated/en/`). Données de la Commission, réutilisables avec mention de la source (politique open data de la Commission) | Non, appel JSON | Workflow 04, 1 appel par semaine |
| **Base LMR pesticides UE** | Limites de résidus pour la mangue | Export officiel + API listées sur data.europa.eu (jeu « pesticides ») | Non | Workflow 04, contrôle mensuel, alerte si une LMR change |
| **EUROPHYT / TRACES** | Interceptions pour mouches des fruits (le vrai risque mangue fraîche) | Fichiers mensuels arrêtés en déc. 2021 ; depuis 2022, uniquement un tableau de bord QlikSense mis à jour le 6 et le 21 | Trop fragile | Saisie manuelle dans un onglet « alertes » du Google Sheet (à partir du tableau de bord ou des rapports mensuels AGRINFO) |
| **RNM FranceAgriMer** | Prix Rungis hebdo | Pages web ; textes du site sous licence etalab-2.0, à confirmer pour les cotations | **Oui, léger** | Option dans le workflow 01 : 1 requête le vendredi, le formulaire reste en secours |
| Access2Markets, Global Trade Helpdesk | Droits, procédures | Pas d'API, contenu stable | Inutile | Lecture manuelle pour les fiches marché |
| Trade Map | Parts de marché | CGU interdisent l'extraction | Interdit | Export manuel → Google Sheet (déjà en place) |
| GlobalGAP, MANSA | Annuaire B2B | Recherche publique, CGU restrictives | Non | Plus tard, par partenariat |

Points non vérifiés : le réseau de mon environnement bloque ces sites, je n'ai donc pas pu tester l'interface RASFF ni la
structure des pages RNM. Le format exact du filtre RASFF (noms des champs du corps JSON) se confirme en 2 minutes dans
n8n ou avec l'onglet Réseau (F12) du navigateur sur le portail.

## Workflow 04 « Veille conformité » (proposé en premier)
1. **Déclencheur** : chaque lundi 6 h (Abidjan) + lancement manuel.
2. **RASFF** : *HTTP Request* POST, filtres = pays d'origine (CI, SN, BF, ML, BJ, GH, GN), catégorie fruits et légumes
   (et fruits à coque pour plus tard), 30 derniers jours, pages de 50.
3. **Normaliser** (*Code*) : référence, date, produit, pays d'origine, danger, décision (refoulement, retrait, information),
   lien vers la notification ; classer le danger (pesticides, aflatoxines, microbiologie, documentaire…) ; repérer la mangue
   par mots-clés.
4. **Onglet « alertes » du Google Sheet** : lu dans le même workflow pour les interceptions EUROPHYT saisies à la main.
5. **Enregistrer** dans `ie.alertes_conformite` (clé = source + référence, donc jamais de doublon).
6. **Si nouvelle alerte mangue** : résumé IA en 3 lignes (OpenRouter), e-mail admin, et ajout au bulletin du vendredi (workflow 02).
7. **Mensuel** : LMR mangue depuis la base pesticides UE → `ie.lmr_mangue` ; alerte si une valeur change.
8. **Site** : point d'accès public `GET /webhook/conformite-mangue` qui renvoie un feu vert/orange/rouge par pays,
   calculé par comptage (alertes sur 12 mois et 3 mois, seuils fixes), et la liste détaillée réservée au bulletin Premium.
   La section Alertes du site passe des exemples aux vraies données, avec repli sur les exemples comme aujourd'hui.
9. **Journal** : une ligne par exécution dans `ie.journal_collectes` (source, lignes reçues, lignes nouvelles, erreur).

Livrables : `n8n/workflows/04_veille-conformite.json`, `GUIDE-04`, `infra/supabase/04_conformite.sql`, onglet « alertes »
ajouté au modèle de Google Sheet, mise à jour de `Alertes.tsx` et `marketData.ts`.

## Option : prix RNM automatiques (workflow 01)
*HTTP Request* sur la page de cotation mangue le vendredi → *HTML* (extraction du tableau) → mêmes champs que le formulaire
→ `ie.cotations`. Si la page change ou ne répond pas, e-mail admin et le formulaire actuel reste utilisable. Avant de le
construire : lire les mentions légales du site RNM et vérifier s'il propose déjà un export (Excel/CSV), qui serait préférable.
