# Comparaison : conversation Gemini « Sélection de plateformes d'intelligence commerciale » vs notre projet

Date : 2026-10-26. Analyse seulement, rien n'a été modifié dans le projet.

## En bref
La conversation apporte surtout **un pilier que nous avons laissé de côté : la conformité sanitaire (rejets aux frontières UE)**,
et un rappel de méthode utile : **tester la vente d'une note faite à la main avant d'automatiser davantage**.
Sur le reste (prix, outils, coûts, modèle gratuit/payant), notre approche est plus réaliste et mieux adaptée à un projet porté seul.

## 1. Ce que nous avons oublié ou repoussé

| # | Sujet soulevé par Gemini | Où nous en sommes | Importance |
|---|---|---|---|
| 1 | **Alertes de conformité** (refus aux frontières UE, LMR pesticides) et indicateur vert/orange/rouge par produit et pays | Prévu en phase 5 (« workflow 04 alertes normes »), rien de construit. La section Alertes du site affiche des exemples. | Haute : c'est la vraie peur de l'exportateur, et le meilleur argument de vente |
| 2 | **Test commercial manuel** : une note de 3 pages, faite à la main, proposée à 5–15 contacts à un prix symbolique (5 000 FCFA / 10 €) | Notre phase 2 « Fiche Marché » n'est pas encore faite ; on a automatisé (01, 02, 03) avant d'avoir un premier acheteur | Haute |
| 3 | **Mangue séchée** (vendue toute l'année) et angle « bilan de campagne » en octobre | Le pilote ne suit que la mangue fraîche, hors saison ouest-africaine en ce moment | Moyenne, très peu coûteux |
| 4 | **Référentiel produits** SH6 ↔ NC8 ↔ nom commercial, et référentiel pays (CEDEAO, UEMOA, UE) | `ie.flux_commerce` stocke un `produit_code` en texte libre, sans table de correspondance | Moyenne (devient nécessaire dès le 2e produit) |
| 5 | **Prix unitaire à l'import** (valeur ÷ poids, €/kg) et **saisonnalité** mois par mois | Les données Comext ont déjà valeur et poids, mais on ne calcule pas le €/kg | Moyenne, presque gratuit à ajouter |
| 6 | **Clients institutionnels** (Enabel, banques, agences de promotion export, chambres de commerce) avec licence multi-comptes | Notre offre ne vise que l'abonné individuel | Moyenne : ce sont eux qui ont un budget |
| 7 | **Journal des collectes** (date, lignes insérées, erreurs) | n8n garde l'historique 7 jours seulement | Faible, mais utile pour savoir quand une source casse |
| 8 | Annuaire B2B vérifié (GlobalGAP, Bio) | Déjà dans le brief via MANSA, phase intermédiation | Plus tard, comme prévu |

**Une correction importante sur le point 1.** Gemini parle uniquement du **RASFF**. Or pour la mangue fraîche, le principal motif
de refus en Europe, ce sont les **mouches des fruits** (organismes nuisibles), qui ne passent pas par le RASFF mais par
**EUROPHYT / TRACES** (interceptions phytosanitaires, rapports mensuels publiés par la Commission). Le RASFF couvre les risques
alimentaires (pesticides, aflatoxines, salmonelle), plus pertinents pour la mangue séchée, l'anacarde ou le sésame.
Une veille mangue sérieuse doit donc suivre les deux. Accès et conditions de réutilisation de ces deux sources : à vérifier
(pas d'API officielle connue de mon côté, le scraping proposé par Gemini est à proscrire tant que les CGU ne sont pas lues).

## 2. Ce qui est meilleur de notre côté

- **Les prix hebdomadaires RNM (Rungis).** Gemini ne les mentionne jamais. C'est pourtant notre donnée la plus fraîche et celle
  qui parle directement au portefeuille de l'exportateur. Sa promesse de « temps réel » repose sur Comext, qui a environ
  45 jours de retard : c'est faux, alors que notre brief parle honnêtement de « temps réel adapté aux périssables ».
- **Une pile à 0 € tenable seul** (n8n + Supabase + site Vite). Gemini suppose une équipe (programmeur, statisticien),
  FastAPI, scripts Python, Next.js : beaucoup plus lourd pour le même résultat au stade pilote.
- **Le gratuit/payant déjà pensé finement** : prix publics décalés de 4 semaines, première phrase de la lecture visible et suite
  floutée, bulletin complet le vendredi par e-mail et WhatsApp. Gemini reste au niveau « formule Pro à 50 € ».
- **Le respect des sources** : nous avons écarté le scraping de Trade Map pour raison de CGU ; Gemini propose de scraper
  RASFF, EFSA et GlobalGAP sans se poser la question.
- **Le score de risque proposé est trop ambitieux pour nos volumes.** Avec quelques notifications par an pour la mangue
  ivoirienne, une normalisation min-max et des poids α/β n'ont pas de sens statistique, et le qualifier de « prédictif » serait
  trompeur. Un simple comptage (12 derniers mois et 3 derniers mois) avec des seuils fixes suffit et reste honnête.
- Le script Python fourni est un gabarit sur une API fictive (et contient une erreur, `fot=`) : rien à reprendre.

## 3. Ajustements proposés (par ordre de priorité)

1. **Faire la Note Flash mangue à la main maintenant** : « Bilan de campagne 2026 et préparation 2027 » (3 pages :
   flux et origines, refus aux frontières, calendrier et conseils). C'est notre Fiche Marché de la phase 2. La proposer à
   10–15 contacts à 5 000 FCFA (ou en pré-commande) avant d'automatiser autre chose. Claude peut préparer le plan et les chiffres
   Comext ; la collecte RASFF/EUROPHYT est manuelle pour ce premier numéro.
2. **Ajouter la mangue séchée au workflow 03** (code NC à confirmer, probablement 0813 40 95, regroupe d'autres fruits séchés)
   et afficher le prix unitaire import en €/kg. Petit changement.
3. **Construire le pilier conformité en version simple** : un onglet « alertes » dans le Google Sheet du workflow 03 (saisie
   à la main depuis RASFF et EUROPHYT), une table `ie.alertes_conformite`, et un feu vert/orange/rouge sur le site basé sur
   un comptage. Automatiser seulement si une source propose un export ou un flux autorisé.
4. **Créer un référentiel `ie.produits`** (SH6, NC8, noms FR/EN, saison de récolte par pays) au moment d'ajouter le 2e produit.
5. **Ajouter une ligne « Institutions » dans les offres** (sur devis, plusieurs comptes), et envisager une note Flash
   à l'unité moins chère (10–15 €) à côté du rapport à 115 €, qui peut sembler élevé pour une PME ouest-africaine.
6. **Petit journal des collectes** (`ie.journal_collectes`) alimenté par les workflows 01 et 03.

Aucun de ces points n'est lancé : à valider par DRAMANE.
