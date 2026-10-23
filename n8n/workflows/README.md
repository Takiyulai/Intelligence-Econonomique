# Workflows n8n

Exports JSON des workflows (menu du workflow → *Download*). Les exports ne contiennent pas les clés : les credentials
restent dans n8n et doivent être re-sélectionnées après un import.

| Fichier | Rôle | Déclencheur | Statut |
|---|---|---|---|
| `01_barometre-mangue.json` | Saisie des cotations RNM (formulaire) → Supabase → commentaire IA ; API publique lue par le site (prix décalés de 4 semaines, 1re phrase du commentaire). Guide : [GUIDE-01-barometre-mangue.md](GUIDE-01-barometre-mangue.md) | Formulaire + GET | Prêt, testé en local |
| `02_bulletin-abonnes.json` | Bulletin complet de la semaine → e-mail aux abonnés (`ie.abonnes`) via Resend + message WhatsApp à coller pour vous. Guide : [GUIDE-02-bulletin-abonnes.md](GUIDE-02-bulletin-abonnes.md) | Vendredi 8 h | Prêt, à tester avec Resend |
| `03_alertes-normes.json` | Surveille les changements réglementaires UE et alerte | Quotidien | Phase 5 |
