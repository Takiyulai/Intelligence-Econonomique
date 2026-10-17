-- Tables métier du baromètre, dans un schéma « ie » séparé des tables internes de n8n.
-- À exécuter une fois : Supabase → SQL Editor → coller ce fichier → Run. Peut être relancé sans risque.
-- Le schéma « ie » n'est pas exposé par l'API publique de Supabase : seul n8n (connexion Postgres) y accède.

create schema if not exists ie;

create table if not exists ie.cotations (
  id            bigint generated always as identity primary key,
  produit       text         not null default 'mangue',
  date_cotation date         not null,
  marche        text         not null,
  stade         text         not null default 'grossiste',
  origine       text         not null,
  variete       text         not null default '',
  calibre       text         not null default '',
  prix_min      numeric(8,2) not null check (prix_min > 0),
  prix_max      numeric(8,2) not null check (prix_max >= prix_min),
  prix_moyen    numeric(8,2) generated always as (round((prix_min + prix_max) / 2, 2)) stored,
  unite         text         not null default '€/kg',
  source        text         not null,
  source_url    text,
  cree_le       timestamptz  not null default now(),
  -- une seule ligne par cotation : une nouvelle saisie identique met à jour les prix
  unique (produit, date_cotation, marche, origine, variete, calibre)
);

create index if not exists cotations_produit_date_idx on ie.cotations (produit, date_cotation desc);

-- Commentaire hebdomadaire rédigé par l'IA (une ligne par produit et par semaine ISO « AAAA-SS »)
create table if not exists ie.syntheses (
  produit  text        not null,
  semaine  text        not null,
  texte    text        not null,
  modele   text,
  cree_le  timestamptz not null default now(),
  primary key (produit, semaine)
);

-- Sécurité : aucune lecture possible via l'API publique (anon / authenticated)
alter table ie.cotations enable row level security;
alter table ie.syntheses enable row level security;
revoke all on schema ie from anon, authenticated;
