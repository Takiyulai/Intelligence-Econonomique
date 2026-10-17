/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL publique du webhook n8n qui sert le baromètre (ex. https://n8n-mmc3.onrender.com/webhook/barometre-mangue) */
  readonly VITE_N8N_BAROMETRE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
