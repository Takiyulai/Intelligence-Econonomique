-- Données du workflow n8n 04 « Veille conformité » : alertes aux frontières de l'UE (RASFF, interceptions EUROPHYT
-- saisies dans le Google Sheet), limites de résidus de pesticides (LMR) de la mangue, et journal des collectes.
-- À exécuter une fois après 01_cotations.sql : Supabase → SQL Editor → coller ce fichier → Run. Peut être relancé sans risque.

-- Une alerte = une notification RASFF, une interception saisie à la main, ou un changement de LMR détecté.
create table if not exists ie.alertes_conformite (
  source       text        not null check (source in ('rasff', 'europhyt', 'agrinfo', 'manuel', 'ue-lmr')),
  reference    text        not null,             -- n° RASFF (ex. 2026.6073), empreinte de la ligne du Sheet, ou clé LMR
  date_alerte  date        not null,
  produit      text        not null default 'autre',   -- mangue, piment, ananas ou autre
  pays         text        not null default '',  -- code ISO du pays d'origine (CI, SN…)
  pays_nom     text        not null default '',
  danger       text        not null default 'autre',   -- pesticides, mycotoxines, microbiologie, organismes nuisibles, additifs, documentaire, autre
  gravite      text        not null default '',  -- telle que donnée par la source (serious, not serious…)
  decision     text        not null default '',  -- refoulement à la frontière, alerte, information, changement de LMR…
  titre        text        not null,
  titre_fr     text        not null default '',  -- traduction française du titre (RASFF publie en anglais)
  detail       text        not null default '',
  url          text,
  brut         jsonb,                            -- réponse d'origine, pour ne rien perdre si le format change
  cree_le      timestamptz not null default now(),
  maj_le       timestamptz not null default now(),
  primary key (source, reference)
);

create index if not exists alertes_conformite_produit_idx on ie.alertes_conformite (produit, date_alerte desc);
create index if not exists alertes_conformite_pays_idx on ie.alertes_conformite (pays, date_alerte desc);

-- Dernière LMR connue pour chaque substance sur la mangue (base pesticides de l'UE). Un changement crée une alerte « ue-lmr ».
create table if not exists ie.lmr (
  produit         text          not null default 'mangue',
  residu_id       text          not null,
  residu_nom      text          not null default '',
  valeur          numeric(12,4),
  unite           text          not null default 'mg/kg',
  date_application date,
  maj_le          timestamptz   not null default now(),
  primary key (produit, residu_id)
);

-- Une ligne par collecte : permet de voir quand une source ne répond plus ou change de format.
create table if not exists ie.journal_collectes (
  id         bigint generated always as identity primary key,
  workflow   text        not null,
  source     text        not null,
  recues     int         not null default 0,
  nouvelles  int         not null default 0,
  erreur     text,
  cree_le    timestamptz not null default now()
);

create index if not exists journal_collectes_idx on ie.journal_collectes (workflow, source, cree_le desc);

-- Même règle que les autres tables : invisibles depuis l'API publique, seul n8n y accède.
alter table ie.alertes_conformite enable row level security;
alter table ie.lmr enable row level security;
alter table ie.journal_collectes enable row level security;
revoke all on schema ie from anon, authenticated;
