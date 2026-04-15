import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taxi Bordeaux Gare Saint-Jean | Réservation Taxi Bordeaux 24h/24',
  description: 'Réservez votre taxi Bordeaux Gare Saint-Jean en quelques secondes. Taxi bordelais professionnel disponible 24h/24. Bordeaux taxis transfers vers aéroport, centre-ville et toute la région. Tarifs réglementés.',
  keywords: 'taxi bordeaux gare, taxi bordeaux, taxi bordelais, réserver taxi bordeaux, taxi bordeaux saint jean, reservation taxi bordeaux, bordeaux taxis transfers, taxi service in bordeaux',
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/gare',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/gare',
      'x-default': 'https://www.taxibordeauxsolution.fr/gare',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
