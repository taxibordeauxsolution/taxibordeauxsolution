import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taxi Gare Saint-Jean Bordeaux | Dépose & Prise en Charge — Taxi Bordeaux Solution',
  description: 'Taxi Gare Saint-Jean de Bordeaux : départ et arrivée, disponible 24h/24. Chauffeur professionnel, tarifs transparents. Appelez le 06 67 23 78 22.',
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
