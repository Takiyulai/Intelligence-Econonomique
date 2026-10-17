# Synthèse du brief (août 2026)

Source : `docs/brief/Plateforme_Intelligence_Economique_Complet.pdf` (3 pages).

## Problème
Les producteurs, coopératives et PME d'Afrique de l'Ouest négocient avec un fort déficit d'information face aux acheteurs
européens. La plateforme réduit cette asymétrie en traduisant des données brutes en outils de décision simples.

## « Temps réel » adapté aux produits périssables
| Donnée | Fréquence | Usage pour l'abonné |
|---|---|---|
| Prix spot (Rungis, Rotterdam) | Hebdo / quotidien | Fixer prix d'achat local et prix d'offre export |
| Volumes et flux logistiques | Mensuel / hebdo | Anticiper saturation des marchés UE, pénurie de conteneurs reefer |
| Réglementations, certifications | Alerte instantanée | LMR, règles d'interception aux frontières UE |

## Quatre sources institutionnelles
| Source | Donnée brute | Produit fini |
|---|---|---|
| Trade Map (ITC) | Volumes, parts de marché, codes SH | Tendances : pays UE en croissance, parts CEDEAO |
| Global Trade Helpdesk | Droits, normes SPS, procédures | Fiches conformité produit/pays |
| MANSA (Afreximbank) | Entreprises africaines vérifiées (KYC) | Label de confiance pour acheteurs UE |
| RNM (FranceAgriMer) | Cotations sur les marchés de gros français | Baromètre hebdomadaire des prix |

## Lancement rapide (« hack 48 h »)
Collecter à la main les cours d'un fruit clé (ex. mangue), rédiger un bulletin et le vendre via un groupe WhatsApp Premium
(Mobile Money) ou une newsletter Substack, avant de construire le site.

## Feuille de route pilote
1. Semaine 1 : choisir le corridor et le produit pilote (mangue ou piment frais).
2. Semaine 2 : historique des volumes (Trade Map) + exigences SPS (GTH) → « Fiche Marché ».
3. Chaque vendredi : cotations RNM → baromètre.
4. Lancement : diffusion à un groupe test de PME/coopératives, conversion en abonnés payants.

## Modèle économique
- Freemium SaaS (tendances gratuites ; prix, volumes, alertes en Premium).
- Rapports sectoriels vendus à l'unité.
- Intermédiation commerciale (commission ou frais fixes).

Cible : PME agro-exportatrices, coopératives, intermédiaires d'Afrique de l'Ouest.

## Écarts décidés par rapport au brief
- n8n auto-hébergé à la place de Make.com / Zapier.
- Modèles gratuits OpenRouter à la place de ChatGPT / Claude pour commencer.
