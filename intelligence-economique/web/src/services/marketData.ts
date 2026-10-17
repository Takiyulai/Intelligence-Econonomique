// Seule porte d'entrée des données de l'application.
// Pour brancher une vraie source (Airtable, API, n8n), modifier uniquement ce fichier.
import { alertes, produits, seriesPrix } from '../data/demo'
import type { AlerteNorme, Produit, ProduitId, SeriePrix } from '../data/types'

export async function getProduits(): Promise<Produit[]> {
  return produits
}

export async function getSeriePrix(produit: ProduitId): Promise<SeriePrix | undefined> {
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
