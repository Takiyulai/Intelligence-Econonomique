// Seule porte d'entrée de l'espace membre : connexion par lien magique et données du tableau de bord.
// Les droits (gratuit ou Premium) sont décidés dans Supabase par les fonctions public.espace_* (infra/supabase/06).
// Sans Supabase configuré, tout fonctionne en démonstration avec des données d'exemple.
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { seriesPrix } from '../data/demo'
import type { CouleurFeu } from '../data/types'

export type Profil = '' | 'exportateur' | 'cooperative' | 'acheteur' | 'institution' | 'autre'
export type StatutAbonnement = 'gratuit' | 'premium' | 'expire'

export const PROFILS: { valeur: Profil; label: string }[] = [
  { valeur: 'exportateur', label: 'Exportateur' },
  { valeur: 'cooperative', label: 'Coopérative ou producteur' },
  { valeur: 'acheteur', label: 'Acheteur ou importateur' },
  { valeur: 'institution', label: 'Institution ou projet' },
  { valeur: 'autre', label: 'Autre' },
]

export interface Abonnement {
  statut: StatutAbonnement
  formule?: string
  depuis?: string
  /** AAAA-MM-JJ ; absent = sans date de fin */
  date_fin?: string | null
  jours_restants?: number | null
}

export interface Membre {
  email: string
  nom: string
  entreprise: string
  pays: string
  whatsapp: string | null
  profil: Profil
  membre_depuis: string
  abonnement: Abonnement
  /** Reçoit le bulletin gratuit du vendredi */
  bulletin: boolean
}

export interface SemainePrix {
  cle: string
  semaine: string
  prix: number
  min: number
  max: number
  nb: number
  derniere: string
}

export interface Commentaire {
  cle: string
  texte: string
  complet: boolean
}

export interface FeuMembre {
  pays: string
  nom: string
  couleur: CouleurFeu
  alertes3m: number
  alertes12m: number
  derniere: string | null
}

export interface AlerteMembre {
  date: string
  titre: string
  pays: string
  danger: string
  decision: string
  source: string
  url: string | null
}

export interface InfoTerrain {
  date: string
  categorie: string
  pays: string
  titre: string
  detail: string
  source: string
  url: string | null
}

export interface Tableau {
  premium: boolean
  decalage_semaines: number
  marche: string
  prix: SemainePrix[]
  commentaires: Commentaire[]
  archive: string[]
  feux: FeuMembre[]
  alertes_30j: number
  /** null pour les gratuits : réservé Premium */
  alertes: AlerteMembre[] | null
  infos: InfoTerrain[] | null
  note_mensuelle: { mois: string; texte: string } | null
  veille_maj_le: string | null
  /** true = données de démonstration */
  exemple?: boolean
}

export const espaceBranche = Boolean(supabase)

/** Démonstration : /espace?demo=premium montre la vue abonné. */
const demoPremium = () => new URLSearchParams(window.location.search).get('demo') === 'premium'

// ---------- Connexion ----------

export type ResultatLien = { ok: true; demo?: boolean } | { ok: false; nouveau?: boolean; message: string }

/**
 * Envoie un lien magique. Sans `inscription`, n'écrit qu'à un compte existant : si l'adresse est inconnue,
 * renvoie `nouveau: true` pour que la page demande l'accord d'inscription avant de créer le compte.
 */
export async function envoyerLien(
  email: string,
  inscription?: { profil: Profil; consentement: boolean },
): Promise<ResultatLien> {
  const adresse = email.trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adresse)) return { ok: false, message: "Cette adresse e-mail n'est pas valide." }
  if (!supabase) return { ok: true, demo: true }
  if (inscription && !inscription.consentement) return { ok: false, message: "Cochez la case d'accord pour créer votre compte." }
  const { error } = await supabase.auth.signInWithOtp({
    email: adresse,
    options: {
      emailRedirectTo: `${window.location.origin}/espace`,
      shouldCreateUser: Boolean(inscription),
      data: inscription
        ? {
            profil: inscription.profil,
            consentement: 'oui',
            source: new URLSearchParams(window.location.search).get('utm_source') ?? 'site',
          }
        : undefined,
    },
  })
  if (!error) return { ok: true }
  if (!inscription && (error.code === 'otp_disabled' || /signups? not allowed/i.test(error.message)))
    return { ok: false, nouveau: true, message: '' }
  if (error.status === 429 || /rate limit|security purposes/i.test(error.message))
    return { ok: false, message: 'Un lien vient déjà de partir. Patientez une minute avant de redemander.' }
  return { ok: false, message: "Le lien n'a pas pu être envoyé. Réessayez dans quelques minutes." }
}

export async function lireSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function surChangementSession(rappel: (session: Session | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_evenement, session) => rappel(session))
  return () => data.subscription.unsubscribe()
}

export async function deconnecter(): Promise<void> {
  await supabase?.auth.signOut()
}

// ---------- Données ----------

async function appeler<T>(fonction: string, args?: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.rpc(fonction, args)
  if (error) throw new Error(error.message)
  return data as T
}

export async function lireMembre(): Promise<Membre> {
  if (!supabase) return membreDemo()
  return appeler<Membre>('espace_moi')
}

export async function lireTableau(): Promise<Tableau> {
  if (!supabase) return tableauDemo()
  return appeler<Tableau>('espace_tableau')
}

export async function majProfil(
  champs: Partial<Pick<Membre, 'nom' | 'entreprise' | 'pays' | 'whatsapp' | 'profil' | 'bulletin'>>,
): Promise<Membre> {
  if (!supabase) return { ...membreDemo(), ...champs } as Membre
  return appeler<Membre>('espace_maj_profil', { donnees: champs })
}

// ---------- Démonstration ----------

function membreDemo(): Membre {
  const premium = demoPremium()
  const fin = new Date(Date.now() + 23 * 864e5).toISOString().slice(0, 10)
  return {
    email: 'vous@exemple.com',
    nom: '',
    entreprise: '',
    pays: '',
    whatsapp: null,
    profil: 'exportateur',
    membre_depuis: new Date().toISOString().slice(0, 10),
    abonnement: premium
      ? { statut: 'premium', formule: 'premium', depuis: '2026-10-01', date_fin: fin, jours_restants: 23 }
      : { statut: 'gratuit' },
    bulletin: true,
  }
}

function tableauDemo(): Tableau {
  const premium = demoPremium()
  const points = seriesPrix.find((s) => s.produit === 'mangue')?.points ?? []
  const visibles = premium ? points : points.slice(0, -4)
  const prix = visibles.map((p, i) => ({
    cle: `2026-${p.semaine.slice(1)}`,
    semaine: p.semaine,
    prix: p.prix,
    min: Math.round((p.prix - 0.4) * 100) / 100,
    max: Math.round((p.prix + 0.4) * 100) / 100,
    nb: 3,
    derniere: new Date(Date.now() - (visibles.length - 1 - i + (premium ? 0 : 4)) * 7 * 864e5).toISOString().slice(0, 10),
  }))
  const texte =
    "Exemple : le prix moyen marque une pause après plusieurs semaines de hausse, avec des arrivages ouest-africains plus réguliers. Les écarts de calibre se creusent : les gros calibres se vendent nettement mieux. Conseil d'exemple : privilégier les expéditions de calibre 8 à 10 la semaine prochaine."
  const derniere = prix.at(-1)?.cle ?? ''
  return {
    premium,
    decalage_semaines: premium ? 0 : 4,
    marche: 'Rungis (exemple)',
    prix,
    commentaires: [{ cle: derniere, texte: premium ? texte : texte.split('. ')[0] + '.', complet: premium }],
    archive: points.map((p) => `2026-${p.semaine.slice(1)}`).reverse().slice(0, 8),
    feux: [
      { pays: 'CI', nom: "Côte d'Ivoire", couleur: 'orange', alertes3m: 1, alertes12m: 2, derniere: null },
      { pays: 'SN', nom: 'Sénégal', couleur: 'vert', alertes3m: 0, alertes12m: 0, derniere: null },
      { pays: 'ML', nom: 'Mali', couleur: 'vert', alertes3m: 0, alertes12m: 0, derniere: null },
      { pays: 'BF', nom: 'Burkina Faso', couleur: 'rouge', alertes3m: 3, alertes12m: 4, derniere: null },
    ],
    alertes_30j: 2,
    alertes: premium
      ? [
          { date: '2026-10-20', titre: 'Exemple : mouches des fruits sur mangues', pays: 'Burkina Faso', danger: 'organismes nuisibles', decision: 'interception', source: 'europhyt', url: null },
          { date: '2026-10-08', titre: 'Exemple : résidus de pesticide au-dessus de la LMR', pays: "Côte d'Ivoire", danger: 'pesticides', decision: 'refoulement à la frontière', source: 'rasff', url: null },
        ]
      : null,
    infos: premium
      ? [{ date: '2026-10-24', categorie: 'marché', pays: 'SN', titre: 'Exemple : fin de campagne anticipée au Sénégal', detail: 'Illustration du format des infos terrain réservées aux abonnés.', source: 'analyste', url: null }]
      : null,
    note_mensuelle: premium ? { mois: '2026-09', texte: "Exemple : note mensuelle sur les importations européennes de mangues (Comext)." } : null,
    veille_maj_le: null,
    exemple: true,
  }
}

// ---------- Passer Premium ----------

const WHATSAPP = import.meta.env.VITE_CONTACT_WHATSAPP?.replace(/\D/g, '')
const EMAIL_CONTACT = import.meta.env.VITE_CONTACT_EMAIL?.trim()

/** Lien pour demander l'abonnement (paiement Mobile Money traité à la main) : WhatsApp, sinon e-mail, sinon les offres. */
export function lienPremium(email: string, renouveler = false): { href: string; externe: boolean } {
  const texte = `Bonjour, je souhaite ${renouveler ? 'renouveler mon abonnement' : "m'abonner à l'offre"} Premium du Baromètre mangue (compte : ${email}).`
  if (WHATSAPP) return { href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texte)}`, externe: true }
  if (EMAIL_CONTACT)
    return { href: `mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent('Abonnement Premium')}&body=${encodeURIComponent(texte)}`, externe: true }
  return { href: '/#offres', externe: false }
}

/** « 2026-41 » → « S41 » */
export const semaineDe = (cle: string) => `S${cle.slice(5)}`
