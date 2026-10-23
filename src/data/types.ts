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
  /** Commentaire de la semaine rédigé par l'IA à partir des chiffres (série réelle uniquement) */
  commentaire?: string | null
  /** Début du commentaire visible par tous ; le texte complet est réservé aux abonnés */
  extrait?: string | null
  /** Nombre de semaines de décalage des prix publics (0 ou absent = semaine en cours) */
  decalageSemaines?: number
  /** Date de la dernière cotation, AAAA-MM-JJ (série réelle uniquement) */
  majLe?: string | null
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
