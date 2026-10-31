// Client Supabase du navigateur : seulement la clé publique (« anon » / « publishable »), jamais la clé « service_role ».
// Sans ces deux variables, l'espace membre s'affiche en démonstration et la landing page reste sur les exemples.
import { createClient } from '@supabase/supabase-js'

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL?.trim()
const CLE_PUBLIQUE = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabase =
  URL_SUPABASE && CLE_PUBLIQUE
    ? createClient(URL_SUPABASE, CLE_PUBLIQUE, {
        // « implicit » : le lien magique marche même s'il est ouvert sur un autre appareil que celui de la demande
        auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
      })
    : null
