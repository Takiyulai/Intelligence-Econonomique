# Héberger n8n gratuitement : Render + Supabase + cron de réveil

Configuration en service depuis le 2026-10-15 : **https://n8n-mmc3.onrender.com**

| Rôle | Service gratuit | Limites à connaître |
|---|---|---|
| Exécuter n8n | Render, *Web Service* gratuit (image Docker `n8nio/n8n`) | Veille après 15 min sans trafic ; ~1 min de réveil ; 512 Mo RAM ; disque effacé à chaque redémarrage ; 750 h d'instance par mois **pour tout le compte** |
| Base de données n8n | Supabase, offre gratuite (Postgres) | 500 Mo ; projet mis en pause après 7 jours sans activité |
| Garder n8n éveillé | cron-job.org (ou équivalent) | Une requête toutes les 10 min suffit |
| IA | OpenRouter, modèles gratuits | Quotas bas, voir `docs/architecture.md` |

Pourquoi ça tient : le disque de Render est éphémère, mais tout ce qui compte (workflows, credentials, historique)
est dans Supabase. Le cron empêche la mise en veille, donc les déclencheurs planifiés s'exécutent à l'heure.

**Règle des 750 h** : un service allumé 24 h/24 consomme ~744 h sur un mois de 31 jours. Il n'y a donc de place que
pour **un seul** service gratuit permanent sur le compte Render. Ne pas y ajouter SearXNG ou un autre service gardé éveillé,
sinon tous les services gratuits sont suspendus en fin de mois.

---

## 1. Supabase (base)
1. Projet Supabase → **Connect** → onglet *Connection string* → choisir **Session pooler** (port `5432`).
   Ne pas prendre « Direct connection » (IPv6 uniquement, Render ne la joint pas) ni le *Transaction pooler* (port `6543`).
2. Noter l'hôte (`aws-0-<région>.pooler.supabase.com`), l'utilisateur (`postgres.<ref-du-projet>`) et le mot de passe de la base.
3. Facultatif : *SQL Editor* → `create schema if not exists n8n;` pour isoler les tables de n8n de celles de
   l'application (base de prix, etc.), puis `DB_POSTGRESDB_SCHEMA=n8n`.
   Seulement **avant** le premier démarrage de n8n ; si n8n tourne déjà sur `public`, ne rien changer.

## 2. Render (n8n)
*New → Web Service → Existing image* : `docker.io/n8nio/n8n:latest` (ou une version fixée, plus prudent), offre **Free**.
Variables d'environnement : reprendre la liste de [`render.env.example`](render.env.example) dans *Environment*.
Les points qui causent le plus de pannes :
- `N8N_ENCRYPTION_KEY` **doit** être fixée dans Render. Sans elle, n8n génère une clé sur le disque éphémère et
  toutes les credentials deviennent illisibles au redémarrage suivant. La sauvegarder dans un gestionnaire de mots de passe.
- `WEBHOOK_URL` et `N8N_EDITOR_BASE_URL` = l'adresse publique, sinon les webhooks pointent vers `localhost`.
- `DB_POSTGRESDB_SSL_ENABLED=true` (Supabase exige SSL).
- Purge de l'historique activée pour ne pas remplir les 500 Mo de Supabase.

## 3. Cron de réveil
Sur https://cron-job.org : nouvelle tâche, URL `https://n8n-mmc3.onrender.com/healthz`, toutes les **10 minutes**,
méthode GET. Vérifier dans l'historique de la tâche que la réponse est `200`.
Comme n8n interroge Supabase en permanence, le projet Supabase ne passe pas en pause.

## 4. OpenRouter dans les workflows (ce qui sert au projet)
1. n8n → **Credentials → Add credential → OpenRouter** → coller la clé (elle reste chiffrée dans n8n, nulle part ailleurs).
2. Dans un workflow : *Basic LLM Chain* ou *AI Agent* + sous-nœud **OpenRouter Chat Model**.
   Modèle : `openrouter/free` (routeur qui choisit un modèle gratuit disponible) ou un modèle précis en `:free`.
   Pour des résultats réguliers (bulletin hebdo), préférer un modèle précis et garder `openrouter/free` en secours.
3. Test : *Manual Trigger* → *Basic LLM Chain* → prompt « Résume en une phrase : le prix de la mangue a baissé
   de 8 % à Rungis cette semaine. » → *Execute*.

## 5. L'« Assistant n8n » (menu Assistant) : à laisser de côté pour l'instant
L'Assistant est l'IA qui aide à construire les workflows. D'après la doc n8n
(https://docs.n8n.io/deploy/host-n8n/configure-n8n/set-up-n8n-assistant), il **exige un bac à sable de code** :
- *n8n Sandbox* : trois conteneurs Docker supplémentaires joints par réseau privé. Impossible sur Render gratuit
  (un service gratuit ne reçoit pas de trafic privé, et la règle des 750 h l'interdit de toute façon).
- *Daytona* : payant, carte bancaire.

Sans bac à sable, l'Assistant ne fonctionne pas, même avec le modèle et la recherche web réglés. Ce n'est pas bloquant :
**les workflows du projet n'en ont pas besoin**, ils appellent OpenRouter via le nœud ci-dessus.
- Fenêtre *Connect a model* : on peut enregistrer OpenRouter + *Free Models Router*, c'est sans effet tant qu'il n'y a pas de bac à sable.
- Fenêtre *Add web search* : choisir **Disable web search**. SearXNG demanderait un second service permanent (règle des 750 h) ;
  Brave n'a plus d'offre gratuite depuis février 2026 (carte bancaire, ~1 000 requêtes offertes par mois puis facturation).
- Fenêtre *Add a code sandbox* : **Cancel**.
- Option : `N8N_DISABLED_MODULES=instance-ai` dans Render masque l'Assistant et économise un peu de mémoire.

Pour s'en servir plus tard : passer n8n sur un serveur où Docker tourne (VPS ou VM Oracle « Always Free », fichiers
`docker-compose.yml` et `Caddyfile` de ce dossier), où l'installation n8n fournit SearXNG et le bac à sable.

## 6. Maintenance
| Action | Comment |
|---|---|
| Mettre à jour n8n | Render → *Manual Deploy → Deploy latest reference* (après une sauvegarde) |
| Voir les logs | Render → service → *Logs* |
| Sauvegarder | Exporter chaque workflow en JSON dans `n8n/workflows/` ; un `pg_dump` ponctuel depuis le PC si besoin (Supabase gratuit n'a pas de sauvegarde téléchargeable) |
| Surveiller l'espace | Supabase → *Database → Usage* (rester sous 500 Mo) |

## En cas de problème
- **Page de chargement Render pendant 1 minute** : le service dormait ; vérifier que le cron tourne toutes les 10 min.
- **« Credentials could not be decrypted »** : `N8N_ENCRYPTION_KEY` a changé ou n'était pas fixée. Remettre l'ancienne clé.
- **n8n ne démarre pas, erreur Postgres** : hôte et port du *Session pooler*, utilisateur `postgres.<ref>`, SSL activé.
- **Redémarrages « out of memory »** : workflow trop lourd pour 512 Mo ; le découper, limiter les éléments par exécution.
- **Services suspendus en fin de mois** : quota de 750 h dépassé par un second service gratuit.

---

## Plan B : serveur Docker (Oracle Cloud « Always Free » ou VPS)
Les fichiers `docker-compose.yml`, `Caddyfile` et `.env.example` de ce dossier décrivent une installation n8n + Postgres + Caddy
sur une VM. Ils ne servent pas avec Render ; ils restent prêts si l'on veut l'Assistant n8n complet, plus de mémoire
ou ne plus dépendre du cron.
