# Héberger n8n gratuitement, pas à pas

Objectif : n8n accessible en HTTPS sur `https://<votre-nom>.duckdns.org`, qui tourne 24 h/24 pour 0 €.

## Quel serveur gratuit ?
| Option | Ressources | Verdict |
|---|---|---|
| **Oracle Cloud « Always Free » (VM ARM Ampere)** | Jusqu'à 4 cœurs, 24 Go RAM, ~200 Go disque | **Recommandé** : largement suffisant, gratuit sans limite de durée |
| Google Cloud e2-micro (Always Free) | 1 Go RAM | Possible mais juste pour n8n + Postgres |
| Render / Railway / Hugging Face (offres gratuites) | Mise en veille, disque non persistant | Déconseillé : workflows planifiés manqués, données perdues |
| Votre PC + tunnel Cloudflare | Dépend du PC | Dépannage uniquement : n8n s'arrête quand le PC s'éteint |

Points d'attention Oracle : une carte bancaire est demandée pour vérifier l'identité (pas de débit en restant sur
les ressources « Always Free ») ; les VM ARM sont parfois en rupture dans une région, il faut alors réessayer plus
tard ou choisir une forme plus petite (ex. 2 cœurs / 12 Go). Choisissez la région d'accueil avec soin, elle est définitive
(ex. Paris, Marseille ou Francfort).

---

## Étape 1 — Créer le compte et la VM (Oracle Cloud)
1. Créer un compte sur https://www.oracle.com/cloud/free/ (choisir la région d'accueil).
2. Console → **Compute → Instances → Create instance**.
3. **Image** : Ubuntu 24.04 (ou 22.04). **Shape** : `VM.Standard.A1.Flex` (Ampere ARM), 2 à 4 OCPU, 12 à 24 Go RAM.
4. **SSH keys** : « Generate a key pair » et **télécharger la clé privée** (gardez-la précieusement), ou coller votre clé publique.
5. Créer. Noter l'**IP publique** affichée.

## Étape 2 — Ouvrir les ports 80 et 443
Deux pare-feu à ouvrir.
1. **Côté Oracle** : Instance → Subnet → **Security List** → *Add Ingress Rules* :
   source `0.0.0.0/0`, protocole TCP, ports `80` puis `443`.
2. **Côté VM** (les images Ubuntu d'Oracle bloquent tout par iptables). Se connecter :
   ```bash
   ssh -i chemin/vers/cle-privee ubuntu@IP_PUBLIQUE
   ```
   puis :
   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

## Étape 3 — Obtenir un nom de domaine gratuit (DuckDNS)
1. Aller sur https://www.duckdns.org, se connecter (Google/GitHub).
2. Créer un sous-domaine (ex. `ie-agro`) et y mettre l'**IP publique** de la VM → `ie-agro.duckdns.org`.
   (Plus tard, un vrai nom de domaine pourra le remplacer sans rien réinstaller.)

## Étape 4 — Installer Docker sur la VM
```bash
sudo apt update && sudo apt -y upgrade
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit   # se reconnecter en SSH pour que le groupe docker soit pris en compte
```
Vérifier : `docker compose version`.

## Étape 5 — Déployer n8n
1. Créer le dossier et y copier les 3 fichiers de `infra/n8n/` (`docker-compose.yml`, `Caddyfile`, `.env.example`) :
   ```bash
   mkdir -p ~/n8n && cd ~/n8n
   nano docker-compose.yml   # coller le contenu, puis Ctrl+O, Entrée, Ctrl+X
   nano Caddyfile
   nano .env                 # coller le contenu de .env.example
   ```
2. Générer les secrets **sur le serveur** et les coller dans `.env` :
   ```bash
   openssl rand -hex 24   # → POSTGRES_PASSWORD
   openssl rand -hex 32   # → N8N_ENCRYPTION_KEY
   ```
   Renseigner aussi `DOMAIN` (ex. `ie-agro.duckdns.org`) et `TIMEZONE`.
   Sauvegarder `N8N_ENCRYPTION_KEY` dans un gestionnaire de mots de passe.
3. Lancer :
   ```bash
   chmod 600 .env
   docker compose up -d
   docker compose logs -f caddy n8n   # Ctrl+C pour quitter
   ```
4. Ouvrir `https://ie-agro.duckdns.org` : créer immédiatement le **compte propriétaire** n8n (le premier inscrit devient admin).

## Étape 6 — Brancher OpenRouter
1. Créer un compte sur https://openrouter.ai → *Keys* → créer une clé.
2. Dans n8n : **Credentials → Add credential → OpenRouter** → coller la clé. (Elle reste chiffrée dans n8n, ne la mettez nulle part ailleurs.)
3. Choisir un modèle gratuit sur https://openrouter.ai/models (filtrer « free », identifiant en `:free`).
4. Test : nouveau workflow → *Manual Trigger* → *Basic LLM Chain* avec le sous-nœud *OpenRouter Chat Model* →
   prompt « Résume en une phrase : le prix de la mangue a baissé de 8 % à Rungis cette semaine. » → *Execute*.

## Étape 7 — Maintenance
| Action | Commande (dans `~/n8n`) |
|---|---|
| Mettre à jour n8n | `docker compose pull && docker compose up -d` |
| Voir les logs | `docker compose logs -f n8n` |
| Sauvegarder la base | `docker compose exec postgres pg_dump -U n8n n8n > sauvegarde_$(date +%F).sql` |
| Redémarrer | `docker compose restart` |

Conseils : exporter chaque workflow en JSON dans `n8n/workflows/` du projet ; faire une sauvegarde avant chaque mise à jour ;
Oracle peut récupérer les VM gratuites jugées inactives, un n8n qui exécute des workflows réguliers évite ce cas.

## En cas de problème
- **La page ne s'ouvre pas** : vérifier les deux pare-feu (étape 2) et que DuckDNS pointe sur la bonne IP.
- **Erreur de certificat** : `docker compose logs caddy` ; Let's Encrypt exige les ports 80 et 443 ouverts.
- **« Out of capacity » chez Oracle** : réessayer plus tard ou réduire la taille de la VM.
