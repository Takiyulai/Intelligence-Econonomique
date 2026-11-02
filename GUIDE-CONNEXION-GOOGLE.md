# Bouton « Continuer avec Google » : configuration (20 min, gratuit)

Il faut relier deux comptes : **Google Cloud** (qui affiche l'écran « Choisissez un compte ») et **Supabase** (qui crée le
membre). Faites d'abord le guide de l'espace membre jusqu'à l'étape 4 (Supabase branché sur le site).

Gardez deux onglets ouverts : Supabase et https://console.cloud.google.com

## 1. Copier l'adresse de retour dans Supabase (1 min)
Supabase → **Authentication** → **Sign In / Providers** → **Google**.
Dans le panneau qui s'ouvre, copiez **Callback URL (for OAuth)**. Elle ressemble à :
`https://VOTRE-REF.supabase.co/auth/v1/callback`. Laissez ce panneau ouvert.

## 2. Créer le projet Google Cloud (3 min)
1. https://console.cloud.google.com → connectez-vous avec votre compte Google.
2. En haut à gauche, le sélecteur de projet → **Nouveau projet** → nom `AgroCorridor` → **Créer**, puis sélectionnez-le.

## 3. Décrire l'application à Google (5 min)
1. Menu ☰ → **Google Auth Platform** (ou cherchez « OAuth » dans la barre de recherche) → **Commencer** (*Get started*).
2. *Informations sur l'application* : nom `AgroCorridor`, e-mail d'assistance = le vôtre → **Suivant**.
3. *Cible* (*Audience*) : **Externe** → **Suivant**.
4. *Coordonnées* : votre e-mail → **Suivant** → cochez l'accord → **Créer**.
5. Ne mettez **pas** de logo pour l'instant : un logo déclenche une vérification de Google qui prend plusieurs jours.

## 4. Créer l'identifiant du site (5 min)
1. Dans Google Auth Platform → **Clients** → **Créer un client**.
2. *Type d'application* : **Application Web** ; nom : `Site AgroCorridor`.
3. **Origines JavaScript autorisées** → **Ajouter un URI** : `http://localhost:5173`
   (ajoutez plus tard l'adresse du site en ligne, par exemple `https://agrocorridor.netlify.app`).
4. **URI de redirection autorisés** → **Ajouter un URI** : collez la *Callback URL* copiée à l'étape 1.
5. **Créer**. Une fenêtre affiche l'**ID client** et le **Code secret du client** : copiez les deux tout de suite
   (ou **Télécharger le JSON**). Le code secret ne se réaffiche pas.

## 5. Coller les identifiants dans Supabase (1 min)
Retour au panneau Google de Supabase (étape 1) :
- **Enable Sign in with Google** : activé ;
- **Client IDs** : l'ID client ; **Client Secret (for OAuth)** : le code secret ;
- **Save**.

## 6. Ouvrir la connexion à tout le monde (1 min)
Google Auth Platform → **Cible** (*Audience*) → **Publier l'application** → **Confirmer**.
Tant que l'application est « En test », seuls les comptes ajoutés dans *Utilisateurs test* peuvent se connecter.
Le site ne demande que le nom et l'e-mail : aucune vérification Google n'est nécessaire.

## 7. Tester (2 min)
`npm run dev` → http://localhost:5173 → **Créer un compte** → cochez la case d'accord → **S'inscrire avec Google** →
choisissez votre compte. Vous arrivez sur `/espace`, avec votre nom Google déjà rempli dans **Profil**.
Supabase → Table Editor → schéma **ie** → `membres` : votre fiche ; `prospects` : statut `confirme`.
Sortez, puis **Se connecter** → **Continuer avec Google** : vous revenez directement dans l'espace.

## Ce que vous verrez, et c'est normal
- L'écran Google indique « Continuer vers *VOTRE-REF.supabase.co* ». Afficher votre propre nom de domaine à la place
  demande l'option « Custom domain » de Supabase, payante. Ce n'est pas utile au démarrage.
- Quelqu'un qui passe par **Se connecter** → Google sans avoir de compte en obtient un, mais **sans** bulletin gratuit
  (il n'a pas coché l'accord). Il peut l'activer dans **Profil**.

## Si ça bloque
| Message | Cause | Que faire |
|---|---|---|
| Google : « Erreur 400 : redirect_uri_mismatch » | l'URI de redirection ne correspond pas | étape 4.4 : collez exactement la *Callback URL* de Supabase |
| Google : « Accès bloqué : application en cours de test » | application pas publiée | étape 6, ou ajoutez votre compte dans *Utilisateurs test* |
| Le site : « La connexion Google a échoué » | fournisseur Google pas activé dans Supabase | étape 5 |
| Retour sur `localhost:3000` ou une mauvaise adresse | *Site URL* / *Redirect URLs* de Supabase | guide de l'espace membre, étape 3.2 |
| Ça marche en local mais pas en ligne | adresse du site absente | ajoutez-la dans les *Origines JavaScript* (Google) et dans *Redirect URLs* (Supabase) |
