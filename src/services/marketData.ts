// Seule porte d'entrée des données de l'application.
// Pour brancher une vraie source (Airtable, API, n8n), modifier uniquement ce fichier.
import { alertes, produits, seriesPrix } from '../data/demo'
import type { AlerteNorme, PointPrix, Produit, ProduitId, SeriePrix } from '../data/types'

/** Webhook n8n du baromètre mangue. Sans cette variable, le site reste sur les données d'exemple. */
const URL_BAROMETRE = import.meta.env.VITE_N8N_BAROMETRE_URL?.trim()
const DELAI_MAX_MS = 10_000

let serieMangue: Promise<SeriePrix | undefined> | undefined

/** Lit la série réelle depuis n8n ; renvoie undefined si n8n est absent, injoignable ou sans données. */
async function lireSerieN8n(): Promise<SeriePrix | undefined> {
  if (!URL_BAROMETRE) return undefined
  const controle = new AbortController()
  const minuteur = setTimeout(() => controle.abort(), DELAI_MAX_MS)
  try {
    const reponse = await fetch(URL_BAROMETRE, { signal: controle.signal })
    if (!reponse.ok) return undefined
    const d = await reponse.json()
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
      majLe: typeof d.majLe === 'string' ? d.majLe : null,
    }
  } catch {
    return undefined
  } finally {
    clearTimeout(minuteur)
  }
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

export async function getAlertes(): Promise<AlerteNorme[]> {
  return alertes
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
