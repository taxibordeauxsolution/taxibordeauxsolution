import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taxi Aéroport Bordeaux-Mérignac | Transfert 24h/24 — Taxi Bordeaux Solution',
  description: 'Taxi pour l\'aéroport de Bordeaux-Mérignac : prise en charge à domicile, ponctualité garantie, tarifs fixes. Réservation 24h/24 au 06 67 23 78 22.',
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/aeroport',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/aeroport',
      'x-default': 'https://www.taxibordeauxsolution.fr/aeroport',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
