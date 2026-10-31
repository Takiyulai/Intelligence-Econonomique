# Espace membre : mise en place pas à pas

Ce que les visiteurs vont vivre :
```
Landing page (« Rejoindre » ou « Mon espace »)
  └─► saisit son e-mail ─► reçoit un lien magique (pas de mot de passe)
        └─► clic ─► compte confirmé ─► /espace
              Gratuit : prix décalés de 4 semaines, début du commentaire, feux de conformité, profil, bulletin gratuit
              Premium : semaine en cours, analyses complètes, détail des alertes, infos terrain, note mensuelle, archive
              Abonnement : statut, date de fin, jours restants, bouton « Passer à Premium » / « Renouveler »
```
Ce n'est pas le site qui décide : c'est Supabase qui vérifie, à chaque ouverture, si la personne est Premium. Un gratuit ne peut pas
lire les données payantes, même en bricolant la page.

**Vous pouvez voir l'espace tout de suite, sans rien configurer** : `npm install` puis `npm run dev`, ouvrez
http://localhost:5173/espace (vue gratuite) et http://localhost:5173/espace?demo=premium (vue abonné), avec des données d'exemple.

Durée totale : environ 45 minutes. Faites les étapes dans l'ordre.

---

## Étape 1 : copier les fichiers et installer (5 min)
Décompressez le zip dans `C:\Users\MP-PC\Downloads\IT` en acceptant de remplacer. Puis, dans ce dossier :
```
npm install
```
(une nouvelle librairie arrive : `@supabase/supabase-js`, le client officiel de Supabase).

## Étape 2 : les tables dans Supabase (3 min)
Supabase → **SQL Editor** → **New query**. Exécutez, l'un après l'autre (coller → **Run**) :
1. `infra\supabase\05_prospects.sql` : liste des inscrits au bulletin gratuit ;
2. `infra\supabase\06_espace_membre.sql` : fiches membres, date de fin d'abonnement, fonctions de l'espace.

Résultat attendu : « Success. No rows returned » pour chacun.

## Étape 3 : régler la connexion dans Supabase (10 min)
1. **Authentication → Sign In / Providers → Email** : vérifier que *Email* est activé et *Confirm email* coché.
2. **Authentication → URL Configuration** :
   - *Site URL* : `http://localhost:5173` (vous la changerez à l'étape 7) ;
   - *Redirect URLs* → **Add URL** : `http://localhost:5173/**`.
3. **Authentication → Emails → Templates** : mettez les e-mails en français. Dans *Confirm signup* et dans *Magic Link* :
   - Subject : `Votre lien de connexion à AgroCorridor`
   - Body (remplacer tout le contenu) :
     ```html
     <h2>Votre espace AgroCorridor</h2>
     <p>Cliquez sur le bouton pour vous connecter. Le lien est valable une heure et ne sert qu'une fois.</p>
     <p><a href="{{ .ConfirmationURL }}" style="background:#146c43;color:#ffffff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Ouvrir mon espace</a></p>
     <p style="color:#5b6a61;font-size:12px">Vous n'avez rien demandé ? Ignorez cet e-mail.</p>
     ```
   - **Save** pour chacun.
4. **Project Settings → API Keys** : copiez la *Project URL* et la clé **anon** (ou *publishable*). Jamais la clé
   `service_role` : elle donne tous les droits.

**Important pour les tests** : tant que l'étape 6 n'est pas faite, Supabase n'envoie les liens qu'aux membres de votre
équipe Supabase (votre propre adresse), et 2 e-mails par heure au plus. Testez donc avec **votre** e-mail.

## Étape 4 : brancher le site (2 min)
Ouvrez `.env.local` avec le Bloc-notes et ajoutez :
```
VITE_SUPABASE_URL=https://VOTRE-REF.supabase.co
VITE_SUPABASE_ANON_KEY=la-cle-anon-copiee
VITE_CONTACT_WHATSAPP=225XXXXXXXXXX
VITE_CONTACT_EMAIL=votre@email.com
```
`VITE_CONTACT_WHATSAPP` (format international, sans + ni espaces) sert au bouton « Passer à Premium » : il ouvre WhatsApp
avec un message pré-rempli vers vous. Relancez `npm run dev`.

## Étape 5 : tester (5 min)
1. http://localhost:5173 → section **Rejoindre** → votre e-mail → cochez la case → **S'inscrire**.
2. Ouvrez l'e-mail reçu → **Ouvrir mon espace** : vous arrivez sur `/espace`, en accès **Gratuit**.
3. Supabase → Table Editor → schéma **ie** → `membres` (votre fiche) et `prospects` (statut `confirme`).
4. Passez-vous Premium : `ie.abonnes` → **Insert row** → `email` = votre adresse, `formule` = `premium`,
   `date_fin` = une date dans un mois → **Save**. Rechargez `/espace` : pastille **Premium**, semaine en cours,
   alertes détaillées, jours restants.
5. Mettez `date_fin` à hier : l'espace affiche « Abonnement expiré » et repasse en vue gratuite.
6. **Profil** : remplissez nom et WhatsApp → **Enregistrer**. Décochez le bulletin : vous ne recevrez plus le gratuit.
7. **Sortir**, puis http://localhost:5173/connexion pour vous reconnecter.

## Étape 6 : les e-mails pour tout le monde (avec votre domaine)
Il faut un nom de domaine (environ 10 € par an), vérifié sur Resend (resend.com → **Domains** → **Add domain** →
3 enregistrements DNS chez votre registraire → **Verify**). Puis dans Supabase :
**Authentication → Emails → SMTP Settings** → *Enable custom SMTP* :
- Host `smtp.resend.com`, Port `465`, Username `resend`, Password : votre clé API Resend (`re_…`) ;
- Sender email : `connexion@votre-domaine` ; Sender name : `AgroCorridor` → **Save**.
Puis **Authentication → Rate Limits** : *emails per hour* à 100.
Mettez aussi cet expéditeur dans le nœud **Réglages** du workflow 02 et dans *Préparer l'e-mail* du workflow 05.

## Étape 7 : mettre le site en ligne (10 min, gratuit)
1. Dans le dossier IT : `npm run build` → un dossier `dist` apparaît.
2. Allez sur https://app.netlify.com/drop (compte gratuit) et glissez le dossier `dist` dans la page.
   Netlify vous donne une adresse du type `https://nom-au-hasard.netlify.app` (renommable, ou votre domaine plus tard).
3. Supabase → **Authentication → URL Configuration** : *Site URL* = cette adresse ; *Redirect URLs* → ajouter
   `https://nom-au-hasard.netlify.app/**`.
4. n8n, workflow 02, nœud **Réglages** : `SITE` = cette adresse (lien « Ouvrir mon espace » dans le bulletin gratuit).
À chaque modification du site : `npm run build` et glisser de nouveau `dist`.

## Étape 8 : les workflows n8n (10 min)
- **Workflow 02** : réimporter `n8n\workflows\02_bulletin-abonnes.json` (bulletin gratuit pour les membres, abonnés
  expirés exclus du bulletin payant, nœud **Réglages**). Credentials : `Supabase IE` sur les 4 nœuds Postgres, `Resend` sur
  les 2 nœuds d'envoi ; vos valeurs dans **Réglages**. **Save** puis **Publish**.
- **Workflow 05** (nouveau) : importer `n8n\workflows\05_membres.json`. Il gère le lien « Se désinscrire » des bulletins
  (sans connexion) et vous envoie chaque heure la liste des nouveaux membres. Credentials : `Supabase IE` sur
  *Désinscrire* et *Nouveaux membres*, `Resend` sur *Envoyer l'e-mail* ; votre e-mail en haut de *Préparer l'e-mail*.
  **Save** puis **Publish**.

---

## Au quotidien : gérer les abonnés (Supabase → Table Editor → schéma ie)
| Je veux… | Où | Quoi |
|---|---|---|
| voir mes leads | `prospects`, filtre `statut = confirme` | triez par `profil` ; `membres` donne nom, entreprise, WhatsApp |
| activer un abonné qui a payé | `abonnes` → Insert row | `email` (le même que son compte), `formule` (`premium` ou `fondateur`), `depuis`, `date_fin` |
| renouveler | `abonnes`, sa ligne | repousser `date_fin` |
| couper un accès | `abonnes`, sa ligne | `actif` = false |
| savoir qui expire bientôt | `abonnes`, trier par `date_fin` | l'abonné voit aussi ses jours restants et un bouton « Renouveler » dans son espace |

## Si quelque chose bloque
| Symptôme | Cause probable | Que faire |
|---|---|---|
| L'espace affiche « Démonstration » | variables absentes de `.env.local` ou `npm run dev` pas relancé | étape 4 |
| « Le lien n'a pas pu être envoyé » | adresse hors équipe Supabase sans SMTP, ou limite de 2 e-mails/heure atteinte | tester avec votre adresse, attendre, ou faire l'étape 6 |
| Le lien ouvre une page « localhost refused » ou la mauvaise adresse | *Site URL* / *Redirect URLs* | étape 3.2 (ou 7.3 une fois en ligne) |
| « Ce lien a expiré ou a déjà servi » | lien déjà cliqué (certaines messageries l'ouvrent seules) ou plus d'une heure | redemander un lien depuis /connexion |
| « Impossible de charger votre espace » | `06_espace_membre.sql` pas exécuté | étape 2 |

## Ce qui reste pour plus tard
- Paiement automatique (CinetPay, PayDunya ou FedaPay) : l'abonnement s'activerait seul après paiement.
- Rappel automatique 7 jours avant la fin d'abonnement (l'espace l'affiche déjà).
- Connexion par WhatsApp : payante (SMS), donc l'e-mail reste obligatoire ; le WhatsApp est dans le profil.
