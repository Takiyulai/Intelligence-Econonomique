# Plan de travail pas à pas

Chaque étape se termine par un livrable vérifiable. On ne passe à la suivante que lorsque le livrable existe.

## Déjà fait
- Site web de présentation avec maquette du baromètre et des alertes (`web/`, données d'exemple). Fonctionne sans n8n.

## Phase 0 — Mise en place (semaine 0)
| # | Action | Qui | Livrable |
|---|---|---|---|
| 0.1 | Créer les comptes : Oracle Cloud, DuckDNS, OpenRouter, Airtable, Trade Map | DRAMANE | Comptes actifs |
| 0.2 | Héberger n8n (guide `infra/n8n/GUIDE-HEBERGEMENT.md`, étapes 1 à 5) | DRAMANE, guidé par Claude | n8n accessible en HTTPS |
| 0.3 | Brancher OpenRouter et faire le test (étape 6) | DRAMANE | Un résumé généré par un modèle gratuit |

## Phase 1 — Produit pilote et sources (semaine 1)
| # | Action | Qui | Livrable |
|---|---|---|---|
| 1.1 | Choisir le produit pilote (mangue ou piment frais) et le corridor (ex. Côte d'Ivoire/Sénégal → France) | DRAMANE | Décision notée |
| 1.2 | Vérifier chaque source (accès, format, conditions d'usage) | Claude | `docs/sources-de-donnees.md` validé |
| 1.3 | Créer la base Airtable : tables Produits, Marchés, Cotations, Sources | Claude (schéma) + DRAMANE (création) | Base prête |

## Phase 2 — Fiche Marché (semaine 2)
| # | Action | Qui | Livrable |
|---|---|---|---|
| 2.1 | Exporter l'historique Trade Map du produit (UE ← CEDEAO, code SH) | DRAMANE | Fichier dans `data/brut/` |
| 2.2 | Lister les exigences SPS/LMR (Global Trade Helpdesk, Access2Markets) | Claude | Notes sourcées |
| 2.3 | Rédiger la première Fiche Marché | Claude | `livrables/fiches-marche/<produit>.md` + PDF |

## Phase 3 — Baromètre hebdomadaire automatisé (semaines 3–4)
| # | Action | Qui | Livrable |
|---|---|---|---|
| 3.1 | Collecte manuelle d'une semaine de cotations RNM (référence) | DRAMANE | Tableau de référence |
| 3.2 | Workflow n8n `01_cotations-rnm-hebdo` : vendredi → récupération RNM → structuration IA → Airtable | Claude conçoit, DRAMANE importe | Workflow exporté dans `n8n/workflows/` |
| 3.3 | Workflow `02_bulletin-hebdo` : Airtable → rédaction IA (prompt `prompts/`) → bulletin | Claude | Bulletin généré automatiquement |
| 3.4 | Contrôler 2 vendredis de suite : chiffres du bulletin = chiffres RNM | DRAMANE | Validation |

## Phase 4 — Lancement test (semaines 5–6)
| # | Action | Qui | Livrable |
|---|---|---|---|
| 4.1 | Constituer un groupe test de 10 à 20 PME/coopératives | DRAMANE | Liste de contacts |
| 4.2 | Diffuser gratuitement 2 à 3 bulletins (WhatsApp ou Substack) et recueillir les retours | DRAMANE | Retours notés |
| 4.3 | Proposer l'offre Premium (Mobile Money) | DRAMANE | Premiers abonnés payants |

## Phase 5 — Extension (après validation)
- Workflow d'alertes normes (veille LMR/RASFF → alerte instantanée).
- Automatisation des volumes via l'API Eurostat Comext.
- Portail abonnés (Softr/Glide) + gestion des abonnements et paiements.
- Passage éventuel à des modèles IA payants si la qualité ou les quotas gratuits deviennent limitants.
