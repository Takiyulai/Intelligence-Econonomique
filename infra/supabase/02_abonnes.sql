-- Abonnés Premium qui reçoivent le bulletin du vendredi (workflow n8n 02).
-- À exécuter une fois après 01_cotations.sql : Supabase → SQL Editor → coller ce fichier → Run. Peut être relancé sans risque.
-- Ajouter / désactiver un abonné : Table Editor → schéma « ie » → table « abonnes » (actif = false pour arrêter les envois).

create table if not exists ie.abonnes (
  id        bigint generated always as identity primary key,
  nom       text        not null default '',
  email     text        unique,
  whatsapp  text,
  formule   text        not null default 'premium' check (formule in ('premium', 'fondateur', 'essai')),
  actif     boolean     not null default true,
  depuis    date        not null default current_date,
  notes     text,
  cree_le   timestamptz not null default now(),
  check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Même règle que les autres tables : invisibles depuis l'API publique, seul n8n y accède.
alter table ie.abonnes enable row level security;
revoke all on schema ie from anon, authenticated;
