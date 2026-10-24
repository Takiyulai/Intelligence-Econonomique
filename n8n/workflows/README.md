# Workflows n8n

Exports JSON des workflows (menu du workflow → *Download*). Les exports ne contiennent pas les clés : les credentials
restent dans n8n et doivent être re-sélectionnées après un import.

| Fichier | Rôle | Déclencheur | Statut |
|---|---|---|---|
| `01_barometre-mangue.json` | Saisie des cotations RNM (formulaire) → Supabase → commentaire IA ; API publique lue par le site (prix décalés de 4 semaines, 1re phrase du commentaire). Guide : [GUIDE-01-barometre-mangue.md](GUIDE-01-barometre-mangue.md) | Formulaire + GET | Prêt, testé en local |
| `02_bulletin-abonnes.json` | Bulletin complet de la semaine (avec rubrique conformité mangue si le 04 tourne) → e-mail aux abonnés (`ie.abonnes`) via Resend + message WhatsApp à coller pour vous. Guide : [GUIDE-02-bulletin-abonnes.md](GUIDE-02-bulletin-abonnes.md) | Vendredi 8 h | Prêt, à tester avec Resend |
| `03_donnees-commerce.json` | Chaque mois : Eurostat Comext + UN Comtrade (flux de mangues, sans clé) → `ie.flux_commerce` → note IA ; chaque vendredi : Google Sheet (cotations + infos Trade Map/terrain) → Supabase → commentaire IA. Guide : [GUIDE-03-donnees-commerce.md](GUIDE-03-donnees-commerce.md) | Mensuel + vendredi 7 h | Prêt, à tester dans n8n |
| `04_veille-conformite.json` | Chaque lundi : alertes RASFF sur les produits d'Afrique de l'Ouest + onglet « alertes » du Google Sheet (interceptions EUROPHYT) → `ie.alertes_conformite` → titres traduits par l'IA → e-mail pour vous ; chaque mois : LMR de la mangue (base pesticides UE) avec alerte si une valeur change ; API publique `conformite-mangue` (feu par pays) lue par le site. Guide : [GUIDE-04-veille-conformite.md](GUIDE-04-veille-conformite.md) | Lundi 6 h + le 2 du mois + GET | Prêt, à tester dans n8n |
