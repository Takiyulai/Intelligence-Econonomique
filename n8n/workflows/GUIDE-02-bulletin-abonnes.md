# Workflow 02 : bulletin abonnés du vendredi (Resend)

Fichier à importer : [`02_bulletin-abonnes.json`](02_bulletin-abonnes.json). Il suppose le workflow 01 en place (mêmes tables, même credential `Supabase IE`).

## Ce que fait le workflow
```
Chaque vendredi 8 h (Abidjan) ─► Semaine en cours + commentaire IA complet ─► Bulletin (e-mail HTML + texte WhatsApp)
   ─► Abonnés actifs (ie.abonnes) ─► Resend : un e-mail par abonné + un e-mail pour vous avec le message WhatsApp à coller
```
Le site public, lui, ne reçoit que les prix décalés de 4 semaines et la 1re phrase du commentaire (workflow 01, nœud *Format du site*).

## Étape 1 : la table des abonnés
Supabase → **SQL Editor** → coller [`infra/supabase/02_abonnes.sql`](../../infra/supabase/02_abonnes.sql) → **Run**.
Puis *Table Editor* → schéma **ie** → `abonnes` → *Insert row* : mettez-vous en premier abonné (votre e-mail, formule `fondateur`).
Pour arrêter les envois à quelqu'un : `actif` = false.

## Étape 2 : Resend
1. Créer un compte gratuit sur https://resend.com (3 000 e-mails/mois, 100 par jour).
2. **API Keys → Create API Key** (permission *Sending access*), copier la clé `re_…`.
3. Pour tester tout de suite, pas besoin de domaine : l'expéditeur `onboarding@resend.dev` envoie **uniquement vers l'e-mail de votre compte Resend**.
   Pour écrire à de vrais abonnés : **Domains → Add Domain**, ajouter les enregistrements DNS indiqués chez votre hébergeur de domaine, attendre « Verified ».

## Étape 3 : credential et import dans n8n
1. **Create credential → Header Auth**, nommée `Resend` : Name `Authorization`, Value `Bearer re_votre_cle`.
2. Importer `02_bulletin-abonnes.json` (menu **⋯ → Import from File…**).
3. `Lire la semaine` et `Lire les abonnés` → `Supabase IE` ; `Envoyer avec Resend` → `Resend`.
4. Ouvrir `Préparer les envois` et modifier les 2 lignes du haut :
   `ADMIN` = votre e-mail (celui du compte Resend pour les tests), `EXPEDITEUR` = `Baromètre IE <bulletin@votre-domaine>` une fois le domaine vérifié.
5. **Save**, puis **Publish** pour activer l'envoi automatique du vendredi.

## Étape 4 : tester
Cliquer **Execute workflow** (déclencheur *Tester maintenant*). **Résultat attendu** :
- 4 nœuds verts, `Envoyer avec Resend` renvoie un ou deux `id` ;
- vous recevez le bulletin (avec vous-même dans `ie.abonnes`) et un e-mail « [À coller dans WhatsApp] … » contenant le message prêt à copier ;
- Resend → **Emails** : les envois apparaissent en *Delivered*.

## En cas de problème
- **403 « You can only send testing emails to your own email address »** : domaine non vérifié, n'envoyer qu'à l'e-mail du compte Resend (étape 2.3).
- **401** : la valeur de la credential doit commencer par `Bearer ` (avec l'espace).
- **« Aucune cotation en base »** : saisir d'abord une cotation avec le formulaire du workflow 01.
- **Pas de commentaire dans le bulletin** : le commentaire IA de la dernière semaine n'existe pas encore (l'e-mail pour vous le signale).
