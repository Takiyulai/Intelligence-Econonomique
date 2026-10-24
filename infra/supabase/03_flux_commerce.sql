-- Données du workflow n8n 03 : flux commerciaux (Eurostat Comext, UN Comtrade), infos saisies dans le Google Sheet,
-- et note mensuelle rédigée par l'IA.
-- À exécuter une fois après 01_cotations.sql : Supabase → SQL Editor → coller ce fichier → Run. Peut être relancé sans risque.

-- Un flux = un pays déclarant, un partenaire, un produit, une période. Une nouvelle collecte met la ligne à jour.
create table if not exists ie.flux_commerce (
  source        text          not null check (source in ('comext', 'comtrade', 'trade map', 'manuel')),
  flux          text          not null check (flux in ('import', 'export')),
  declarant     text          not null,             -- code pays ISO du pays qui déclare (FR, CI…) ou EU27_2020
  partenaire    text          not null,             -- code pays ISO du partenaire, W00 = monde
  partenaire_nom text         not null default '',
  produit_code  text          not null,             -- CN8 (Comext) ou SH6 (Comtrade)
  periode       text          not null,             -- « AAAA-MM » (mensuel) ou « AAAA » (annuel)
  valeur        numeric(16,2),
  devise        text          not null,             -- EUR (Comext) ou USD (Comtrade)
  poids_kg      numeric(16,1),
  maj_le        timestamptz   not null default now(),
  primary key (source, flux, declarant, partenaire, produit_code, periode)
);

create index if not exists flux_commerce_periode_idx on ie.flux_commerce (produit_code, periode desc);

-- Infos ajoutées à la main dans l'onglet « infos » du Google Sheet (exports Trade Map, terrain, réglementation…).
create table if not exists ie.infos_manuelles (
  id_ligne    text          primary key,            -- empreinte de la ligne du Sheet : une ligne n'est jamais enregistrée deux fois
  date_info   date          not null,
  categorie   text          not null default 'autre',
  produit     text          not null default 'mangue',
  pays        text          not null default '',
  titre       text          not null,
  detail      text          not null default '',
  valeur      numeric(16,2),
  unite       text          not null default '',
  source      text          not null default '',
  source_url  text,
  maj_le      timestamptz   not null default now()
);

-- Note mensuelle de l'IA sur les flux (une ligne par produit et par mois « AAAA-MM »).
create table if not exists ie.syntheses_commerce (
  produit  text        not null,
  mois     text        not null,
  texte    text        not null,
  modele   text,
  cree_le  timestamptz not null default now(),
  primary key (produit, mois)
);

-- Même règle que les autres tables : invisibles depuis l'API publique, seul n8n y accède.
alter table ie.flux_commerce enable row level security;
alter table ie.infos_manuelles enable row level security;
alter table ie.syntheses_commerce enable row level security;
revoke all on schema ie from anon, authenticated;
