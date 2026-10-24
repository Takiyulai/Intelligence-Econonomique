// Seule porte d'entrée des données de l'application.
// Pour brancher une vraie source (Airtable, API, n8n), modifier uniquement ce fichier.
import { alertes, produits, seriesPrix } from '../data/demo'
import type { AlerteNorme, Conformite, CouleurFeu, FeuPays, NiveauAlerte, PointPrix, Produit, ProduitId, SeriePrix } from '../data/types'

/** Webhook n8n du baromètre mangue. Sans cette variable, le site reste sur les données d'exemple. */
const URL_BAROMETRE = import.meta.env.VITE_N8N_BAROMETRE_URL?.trim()
/** Webhook n8n de la veille conformité (workflow 04). Sans variable dédiée, déduit de l'URL du baromètre. */
const URL_CONFORMITE =
  import.meta.env.VITE_N8N_CONFORMITE_URL?.trim() ||
  (URL_BAROMETRE && /barometre-mangue\/?$/.test(URL_BAROMETRE)
    ? URL_BAROMETRE.replace(/barometre-mangue\/?$/, 'conformite-mangue')
    : undefined)
const DELAI_MAX_MS = 10_000

let serieMangue: Promise<SeriePrix | undefined> | undefined
let conformite: Promise<Conformite> | undefined

/** GET JSON avec délai maximal ; undefined si l'adresse est injoignable ou répond une erreur. */
async function lireJson(url: string): Promise<any> {
  const controle = new AbortController()
  const minuteur = setTimeout(() => controle.abort(), DELAI_MAX_MS)
  try {
    const reponse = await fetch(url, { signal: controle.signal })
    return reponse.ok ? await reponse.json() : undefined
  } catch {
    return undefined
  } finally {
    clearTimeout(minuteur)
  }
}

/** Lit la série réelle depuis n8n ; renvoie undefined si n8n est absent, injoignable ou sans données. */
async function lireSerieN8n(): Promise<SeriePrix | undefined> {
  if (!URL_BAROMETRE) return undefined
  const d = await lireJson(URL_BAROMETRE)
  const points: PointPrix[] = Array.isArray(d?.points)
    ? d.points.filter(
        (p: unknown): p is PointPrix =>
          typeof (p as PointPrix)?.semaine === 'string' && Number.isFinite((p as PointPrix)?.prix),
      )
    : []
  if (!points.length) return undefined
  return {
    produit: 'mangue',
    marche: typeof d.marche === 'string' ? d.marche : 'Rungis',
    unite: typeof d.unite === 'string' ? d.unite : '€/kg',
    points,
    source: typeof d.source === 'string' ? d.source : 'RNM FranceAgriMer',
    exemple: false,
    commentaire: typeof d.commentaire === 'string' ? d.commentaire : null,
    extrait: typeof d.extrait === 'string' ? d.extrait : null,
    decalageSemaines: Number.isFinite(d.decalageSemaines) ? d.decalageSemaines : 0,
    majLe: typeof d.majLe === 'string' ? d.majLe : null,
  }
}

const PRODUITS: ProduitId[] = ['mangue', 'piment', 'ananas']
const NIVEAUX: NiveauAlerte[] = ['info', 'attention', 'urgent']
const COULEURS: CouleurFeu[] = ['vert', 'orange', 'rouge']

/** Lit la veille conformité depuis n8n ; undefined tant qu'elle n'a jamais tourné ou si n8n est injoignable. */
async function lireConformiteN8n(): Promise<Conformite | undefined> {
  if (!URL_CONFORMITE) return undefined
  const d = await lireJson(URL_CONFORMITE)
  if (typeof d?.majLe !== 'string' || !Array.isArray(d.feux)) return undefined
  const feux: FeuPays[] = d.feux
    .filter((f: any) => typeof f?.pays === 'string' && COULEURS.includes(f.couleur))
    .map((f: any) => ({
      pays: f.pays,
      nom: typeof f.nom === 'string' ? f.nom : f.pays,
      couleur: f.couleur,
      alertes3m: Number(f.alertes3m) || 0,
      alertes12m: Number(f.alertes12m) || 0,
      derniere: typeof f.derniere === 'string' ? f.derniere : null,
    }))
  const reelles: AlerteNorme[] = (Array.isArray(d.alertes) ? d.alertes : [])
    .filter((a: any) => typeof a?.id === 'string' && typeof a.titre === 'string' && PRODUITS.includes(a.produit) && NIVEAUX.includes(a.niveau))
    .map((a: any) => ({
      id: a.id,
      titre: a.titre,
      produit: a.produit,
      niveau: a.niveau,
      date: typeof a.date === 'string' ? a.date : '',
      resume: typeof a.resume === 'string' ? a.resume : '',
      exemple: false,
    }))
  return { feux, alertes: reelles, majLe: d.majLe, sources: typeof d.sources === 'string' ? d.sources : 'RASFF (UE)', exemple: false }
}

export async function getProduits(): Promise<Produit[]> {
  return produits
}

export async function getSeriePrix(produit: ProduitId): Promise<SeriePrix | undefined> {
  if (produit === 'mangue') {
    serieMangue ??= lireSerieN8n()
    const reelle = await serieMangue
    if (reelle) return reelle
  }
  return seriesPrix.find((s) => s.produit === produit)
}

/** Série d'exemple disponible immédiatement (premier affichage avant la réponse de n8n). */
export function getSerieExemple(produit: ProduitId): SeriePrix | undefined {
  return seriesPrix.find((s) => s.produit === produit)
}

/** Feux par pays et dernières alertes réelles (workflow 04), sinon les alertes d'exemple. */
export async function getConformite(): Promise<Conformite> {
  conformite ??= lireConformiteN8n().then(
    (reelle) => reelle ?? { feux: [], alertes, majLe: null, sources: '', exemple: true },
  )
  return conformite
}

export function variation(serie: SeriePrix): number {
  const p = serie.points
  if (p.length < 2) return 0
  const prev = p[p.length - 2].prix
  return ((p[p.length - 1].prix - prev) / prev) * 100
}

/** « 2026-10-09 » → « 9 oct. 2026 » */
export function dateCourte(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Texte public de la « Lecture de la semaine » : l'extrait envoyé par n8n, sinon la première phrase du commentaire. */
export function extraitPublic(serie: SeriePrix): string | null {
  if (serie.extrait) return serie.extrait
  if (!serie.commentaire) return null
  return serie.commentaire.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? serie.commentaire
}
