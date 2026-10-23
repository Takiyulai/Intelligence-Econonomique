// DONNÉES D'EXEMPLE : valeurs fictives pour la maquette, à remplacer par les cotations RNM réelles.
import type { AlerteNorme, Produit, SeriePrix } from './types'

export const produits: Produit[] = [
  { id: 'mangue', nom: 'Mangue', codeSH: '0804 50', origines: ["Côte d'Ivoire", 'Sénégal', 'Mali'] },
  { id: 'piment', nom: 'Piment frais', codeSH: '0709 60', origines: ['Sénégal', 'Ghana'] },
  { id: 'ananas', nom: 'Ananas', codeSH: '0804 30', origines: ["Côte d'Ivoire", 'Ghana', 'Bénin'] },
]

const semaines = ['S32', 'S33', 'S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40', 'S41']

const serie = (produit: SeriePrix['produit'], valeurs: number[], extrait: string): SeriePrix => ({
  produit,
  marche: 'Rungis (exemple)',
  unite: '€/kg',
  points: semaines.map((semaine, i) => ({ semaine, prix: valeurs[i] })),
  source: 'Données fictives de démonstration',
  exemple: true,
  extrait,
})

export const seriesPrix: SeriePrix[] = [
  serie('mangue', [2.1, 2.2, 2.15, 2.3, 2.45, 2.4, 2.25, 2.2, 2.35, 2.5], 'Le prix moyen de la mangue gagne 6,4 % sur la semaine, à 2,50 €/kg.'),
  serie('piment', [3.4, 3.3, 3.5, 3.6, 3.55, 3.7, 3.9, 3.8, 3.75, 3.95], 'Le piment frais remonte de 5,3 % sur la semaine, à 3,95 €/kg.'),
  serie('ananas', [1.6, 1.65, 1.62, 1.58, 1.55, 1.6, 1.7, 1.68, 1.72, 1.7], "L'ananas recule légèrement, à 1,70 €/kg (-1,2 % sur la semaine)."),
]

export const alertes: AlerteNorme[] = [
  {
    id: 'a1',
    titre: 'Contrôles renforcés à l’entrée de l’UE',
    produit: 'piment',
    niveau: 'urgent',
    date: 'Exemple',
    resume: 'Illustration du format d’alerte : fréquence de contrôle relevée pour une origine donnée.',
    exemple: true,
  },
  {
    id: 'a2',
    titre: 'Révision d’une limite maximale de résidus (LMR)',
    produit: 'mangue',
    niveau: 'attention',
    date: 'Exemple',
    resume: 'Illustration : une substance voit sa LMR abaissée, à vérifier avec votre fournisseur d’intrants.',
    exemple: true,
  },
  {
    id: 'a3',
    titre: 'Nouveau guide d’accès au marché allemand',
    produit: 'ananas',
    niveau: 'info',
    date: 'Exemple',
    resume: 'Illustration : synthèse des documents obligatoires pour exporter vers l’Allemagne.',
    exemple: true,
  },
]
