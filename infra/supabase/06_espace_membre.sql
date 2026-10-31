-- Espace membre du site (/espace) : connexion par lien magique (Supabase Auth), profil, statut d'abonnement, tableau de bord.
-- À exécuter une fois après 01 à 05 : Supabase → SQL Editor → coller ce fichier → Run. Peut être relancé sans risque.
--
-- Principe de sécurité : le schéma « ie » reste invisible depuis le navigateur. Le site appelle seulement les 3 fonctions
-- « public.espace_… » ci-dessous ; elles identifient le membre connecté (auth.uid()) et décident dans la base ce qu'il a
-- le droit de voir. Un inscrit gratuit ne peut donc pas lire les données Premium, même en modifiant le code de la page.

-- Date de fin des abonnements payants (vide = sans fin, par exemple membre fondateur) et suivi des notifications.
alter table ie.abonnes add column if not exists date_fin date;
alter table ie.prospects add column if not exists notifie_le timestamptz;  -- e-mail « nouveau membre » envoyé (workflow 05)

-- Un membre = un compte de connexion confirmé. Le profil est rempli par le membre dans son espace.
create table if not exists ie.membres (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null,
  nom         text        not null default '',
  entreprise  text        not null default '',
  pays        text        not null default '',
  whatsapp    text,
  profil      text        not null default '' check (profil in ('', 'exportateur', 'cooperative', 'acheteur', 'institution', 'autre')),
  cree_le     timestamptz not null default now(),
  maj_le      timestamptz not null default now()
);
alter table ie.membres enable row level security;
revoke all on schema ie from anon, authenticated;

-- Quand une adresse est confirmée (premier clic sur le lien magique) : fiche membre + inscrit confirmé au bulletin gratuit.
create or replace function ie.membre_confirme() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  p text := coalesce(meta ->> 'profil', '');
begin
  if new.email_confirmed_at is null or new.email is null then return new; end if;
  if tg_op = 'UPDATE' and old.email_confirmed_at is not null then return new; end if;
  if p not in ('exportateur', 'cooperative', 'acheteur', 'institution', 'autre') then p := ''; end if;

  insert into ie.membres (id, email, profil) values (new.id, lower(new.email), p)
  on conflict (id) do nothing;

  insert into ie.prospects (email, profil, source, statut, consentement_le, confirme_le)
  values (lower(new.email), p, coalesce(nullif(meta ->> 'source', ''), 'site'), 'confirme',
          case when meta ->> 'consentement' = 'oui' then now() end, now())
  on conflict (email) where email is not null do update set
    statut = case when ie.prospects.statut = 'client' then 'client' else 'confirme' end,
    profil = coalesce(nullif(excluded.profil, ''), ie.prospects.profil),
    consentement_le = coalesce(excluded.consentement_le, ie.prospects.consentement_le),
    confirme_le = coalesce(ie.prospects.confirme_le, now()),
    desinscrit_le = null,
    maj_le = now();
  return new;
end $$;

drop trigger if exists membre_confirme on auth.users;
create trigger membre_confirme after insert or update of email_confirmed_at on auth.users
  for each row execute function ie.membre_confirme();

-- Statut d'abonnement d'une adresse : premium (actif et pas expiré), expire, ou gratuit.
create or replace function ie.abonnement_de(adresse text) returns jsonb
language sql stable security definer set search_path = '' as $$
  with a as (
    select formule, actif, depuis, date_fin,
           actif and (date_fin is null or date_fin >= current_date) as en_cours
    from ie.abonnes
    where lower(email) = lower(adresse)
    order by (actif and (date_fin is null or date_fin >= current_date)) desc, coalesce(date_fin, 'infinity'::date) desc
    limit 1
  )
  select coalesce((
    select jsonb_build_object(
      'statut', case when en_cours then 'premium' else 'expire' end,
      'formule', formule,
      'depuis', depuis,
      'date_fin', date_fin,
      'jours_restants', case when en_cours and date_fin is not null then date_fin - current_date end)
    from a), jsonb_build_object('statut', 'gratuit'))
$$;

-- Qui suis-je : profil, abonnement, réception du bulletin.
create or replace function public.espace_moi() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  m ie.membres;
  adresse text;
begin
  if uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  select * into m from ie.membres where id = uid;
  if not found then
    -- compte confirmé avant l'installation de ce fichier : on crée sa fiche à la première visite
    select lower(email) into adresse from auth.users where id = uid and email_confirmed_at is not null;
    if adresse is null then raise exception 'compte non confirmé' using errcode = '28000'; end if;
    insert into ie.membres (id, email) values (uid, adresse) returning * into m;
  end if;
  return jsonb_build_object(
    'email', m.email, 'nom', m.nom, 'entreprise', m.entreprise, 'pays', m.pays, 'whatsapp', m.whatsapp,
    'profil', m.profil, 'membre_depuis', m.cree_le::date,
    'abonnement', ie.abonnement_de(m.email),
    'bulletin', coalesce((select statut in ('confirme', 'client') from ie.prospects where email = m.email), false));
end $$;

-- Mise à jour du profil par le membre (seulement ces champs ; l'abonnement se change uniquement côté administrateur).
create or replace function public.espace_maj_profil(donnees jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  m ie.membres;
  w text := nullif(regexp_replace(coalesce(donnees ->> 'whatsapp', ''), '[\s.()-]', '', 'g'), '');
  p text := coalesce(donnees ->> 'profil', '');
begin
  if uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  if w is not null and w !~ '^\+\d{9,15}$' then
    raise exception 'Numéro WhatsApp : indiquez l''indicatif du pays, par exemple +225 07 01 02 03 04' using errcode = '22023';
  end if;
  if p not in ('', 'exportateur', 'cooperative', 'acheteur', 'institution', 'autre') then p := ''; end if;
  update ie.membres set
    nom = left(coalesce(donnees ->> 'nom', nom), 80),
    entreprise = left(coalesce(donnees ->> 'entreprise', entreprise), 120),
    pays = left(coalesce(donnees ->> 'pays', pays), 60),
    whatsapp = case when donnees ? 'whatsapp' then w else whatsapp end,
    profil = case when donnees ? 'profil' then p else profil end,
    maj_le = now()
  where id = uid
  returning * into m;
  if not found then raise exception 'fiche membre introuvable' using errcode = '28000'; end if;

  -- même personne dans la liste du bulletin gratuit : on garde les deux fiches cohérentes
  update ie.prospects set
    nom = m.nom, profil = m.profil,
    whatsapp = case when m.whatsapp is null or exists (select 1 from ie.prospects x where x.whatsapp = m.whatsapp and x.email is distinct from m.email)
                    then whatsapp else m.whatsapp end,
    statut = case when not (donnees ? 'bulletin') or statut = 'client' then statut
                  when (donnees ->> 'bulletin')::boolean then 'confirme' else 'desinscrit' end,
    desinscrit_le = case when donnees ? 'bulletin' and not (donnees ->> 'bulletin')::boolean then now() else desinscrit_le end,
    maj_le = now()
  where email = m.email;
  return public.espace_moi();
end $$;

-- Le tableau de bord : tout ce que le membre a le droit de voir, en une seule réponse.
-- Gratuit : prix décalés de 4 semaines, 1re phrase du commentaire, feux par pays, nombre d'alertes.
-- Premium : semaine en cours, commentaires complets, détail des alertes, infos terrain, note mensuelle du commerce.
create or replace function public.espace_tableau() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  adresse text;
  premium boolean;
  decalage int;
  semaines jsonb;
  derniere_cle text;
begin
  if uid is null then raise exception 'non connecté' using errcode = '28000'; end if;
  select email into adresse from ie.membres where id = uid;
  if adresse is null then select lower(email) into adresse from auth.users where id = uid; end if;
  premium := ie.abonnement_de(adresse) ->> 'statut' = 'premium';
  decalage := case when premium then 0 else 4 end;

  with s as (
    select to_char(date_cotation, 'IYYY-IW') as cle, 'S' || to_char(date_cotation, 'IW') as semaine,
           round(avg(prix_moyen), 2)::float8 as prix, round(min(prix_min), 2)::float8 as prix_min,
           round(max(prix_max), 2)::float8 as prix_max, count(*)::int as nb, max(date_cotation) as derniere
    from ie.cotations where produit = 'mangue' group by 1, 2
  ), visibles as (
    select * from s order by cle desc offset decalage limit 16
  )
  select coalesce(jsonb_agg(jsonb_build_object('cle', cle, 'semaine', semaine, 'prix', prix, 'min', prix_min, 'max', prix_max,
                                               'nb', nb, 'derniere', derniere) order by cle), '[]'::jsonb),
         max(cle)
  into semaines, derniere_cle
  from visibles;

  return jsonb_build_object(
    'premium', premium,
    'decalage_semaines', decalage,
    'marche', coalesce((select string_agg(distinct marche, ', ') from ie.cotations where produit = 'mangue'), 'Rungis'),
    'prix', semaines,
    -- commentaires des semaines visibles : complets pour Premium, 1re phrase pour les gratuits
    'commentaires', coalesce((
      select jsonb_agg(jsonb_build_object('cle', y.semaine,
               'texte', case when premium then y.texte else substring(y.texte from '^.*?[.!?](?=\s|$)') end,
               'complet', premium) order by y.semaine desc)
      from (select * from ie.syntheses where produit = 'mangue' and semaine <= coalesce(derniere_cle, '')
            order by semaine desc limit case when premium then 12 else 1 end) y), '[]'::jsonb),
    -- semaines dont le bulletin existe, pour montrer l'archive (verrouillée pour les gratuits)
    'archive', coalesce((select jsonb_agg(semaine order by semaine desc)
                         from (select semaine from ie.syntheses where produit = 'mangue' order by semaine desc limit 12) z), '[]'::jsonb),
    'feux', coalesce((
      select jsonb_agg(jsonb_build_object('pays', pays, 'nom', nom, 'alertes3m', n3, 'alertes12m', n12, 'derniere', derniere,
               'couleur', case when n3 >= 3 then 'rouge' when n12 >= 1 then 'orange' else 'vert' end) order by ordre, nom)
      from (
        select c.pays, coalesce(c.nom, max(a.pays_nom), c.pays) as nom, c.ordre,
               (count(a.*) filter (where a.date_alerte >= current_date - 90))::int as n3,
               count(a.*)::int as n12, max(a.date_alerte) as derniere
        from (values ('CI', 'Côte d''Ivoire', 1), ('SN', 'Sénégal', 2), ('ML', 'Mali', 3), ('BF', 'Burkina Faso', 4)) as c(pays, nom, ordre)
        left join ie.alertes_conformite a on a.pays = c.pays and a.produit = 'mangue' and a.source <> 'ue-lmr'
          and a.date_alerte between current_date - 365 and current_date
        group by c.pays, c.nom, c.ordre
      ) f), '[]'::jsonb),
    'alertes_30j', (select count(*)::int from ie.alertes_conformite where produit = 'mangue' and date_alerte >= current_date - 30),
    'alertes', case when premium then coalesce((
      select jsonb_agg(jsonb_build_object('date', date_alerte, 'titre', coalesce(nullif(titre_fr, ''), titre), 'pays', pays_nom,
               'danger', danger, 'decision', decision, 'source', source, 'url', url) order by date_alerte desc)
      from (select * from ie.alertes_conformite where produit = 'mangue' order by date_alerte desc limit 15) a), '[]'::jsonb)
      else null end,
    'infos', case when premium then coalesce((
      select jsonb_agg(jsonb_build_object('date', date_info, 'categorie', categorie, 'pays', pays, 'titre', titre, 'detail', detail,
               'source', source, 'url', source_url) order by date_info desc)
      from (select * from ie.infos_manuelles where produit = 'mangue' order by date_info desc limit 10) i), '[]'::jsonb)
      else null end,
    'note_mensuelle', case when premium then (
      select jsonb_build_object('mois', mois, 'texte', texte) from ie.syntheses_commerce where produit = 'mangue'
      order by mois desc limit 1) else null end,
    'veille_maj_le', (select max(cree_le) from ie.journal_collectes where workflow = '04')
  );
end $$;

-- Seuls les membres connectés peuvent appeler ces fonctions, et rien d'autre.
revoke all on function public.espace_moi() from public, anon;
revoke all on function public.espace_maj_profil(jsonb) from public, anon;
revoke all on function public.espace_tableau() from public, anon;
grant execute on function public.espace_moi() to authenticated;
grant execute on function public.espace_maj_profil(jsonb) to authenticated;
grant execute on function public.espace_tableau() to authenticated;
revoke all on function ie.abonnement_de(text) from public;
revoke all on function ie.membre_confirme() from public;
