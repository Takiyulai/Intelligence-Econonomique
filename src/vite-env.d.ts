/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL publique du webhook n8n qui sert le baromètre (ex. https://n8n-mmc3.onrender.com/webhook/barometre-mangue) */
  readonly VITE_N8N_BAROMETRE_URL?: string
  /** URL du webhook de la veille conformité ; par défaut, déduite de VITE_N8N_BAROMETRE_URL (…/webhook/conformite-mangue) */
  readonly VITE_N8N_CONFORMITE_URL?: string
  /** Projet Supabase (Settings → API) : URL et clé publique « anon » / « publishable ». Jamais la clé service_role. */
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Contact pour passer Premium : numéro WhatsApp international sans + (ex. 2250700000000) et/ou e-mail */
  readonly VITE_CONTACT_WHATSAPP?: string
  readonly VITE_CONTACT_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
