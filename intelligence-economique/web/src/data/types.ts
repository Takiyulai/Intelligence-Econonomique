export type ProduitId = 'mangue' | 'piment' | 'ananas'

export interface Produit {
  id: ProduitId
  nom: string
  codeSH: string
  origines: string[]
}

export interface PointPrix {
  semaine: string
  /** Prix moyen grossiste en €/kg */
  prix: number
}

export interface SeriePrix {
  produit: ProduitId
  marche: string
  unite: string
  points: PointPrix[]
  source: string
  /** true tant que la série n'est pas alimentée par une source réelle */
  exemple: boolean
}

export type NiveauAlerte = 'info' | 'attention' | 'urgent'

export interface AlerteNorme {
  id: string
  titre: string
  produit: ProduitId
  niveau: NiveauAlerte
  date: string
  resume: string
  exemple: boolean
}
