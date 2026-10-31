-- Inscrits du site (workflow n8n 05 « Inscription ») : toute personne qui laisse son e-mail ou son WhatsApp.
-- Un inscrit confirmé reçoit le bulletin gratuit du vendredi (workflow 02) ; un abonné payant est dans ie.abonnes.
-- À exécuter une fois après 01_cotations.sql : Supabase → SQL Editor → coller ce fichier → Run. Peut être relancé sans risque.
-- Suivre les leads : Table Editor → schéma « ie » → table « prospects » (filtrer sur statut = confirme, trier par profil).

create table if not exists ie.prospects (
  id              bigint generated always as identity primary key,
  email           text,                         -- en minuscules
  whatsapp        text,                         -- format international : +2250700000000
  nom             text        not null default '',
  profil          text        not null default '' check (profil in ('', 'exportateur', 'cooperative', 'acheteur', 'institution', 'autre')),
  produit         text        not null default 'mangue',
  source          text        not null default 'site',     -- site, salon, recommandation, whatsapp… (ou le utm_source du lien)
  statut          text        not null default 'nouveau' check (statut in ('nouveau', 'confirme', 'client', 'desinscrit')),
  jeton           text        not null default gen_random_uuid()::text unique,  -- secret des liens de confirmation et de désinscription
  consentement_le timestamptz,                  -- case « j'accepte de recevoir le bulletin » cochée (preuve exigée par la loi 2013-450)
  confirme_le     timestamptz,
  relance_le      timestamptz,                  -- rappel de confirmation envoyé (une seule fois)
  desinscrit_le   timestamptz,
  notes           text,
  cree_le         timestamptz not null default now(),
  maj_le          timestamptz not null default now(),
  check (email is not null or whatsapp is not null),
  check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create unique index if not exists prospects_email_idx on ie.prospects (email) where email is not null;
create unique index if not exists prospects_whatsapp_idx on ie.prospects (whatsapp) where whatsapp is not null;
create index if not exists prospects_statut_idx on ie.prospects (statut, cree_le desc);

-- Même règle que les autres tables : invisibles depuis l'API publique, seul n8n y accède.
alter table ie.prospects enable row level security;
revoke all on schema ie from anon, authenticated;
