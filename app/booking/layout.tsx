import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réserver un Taxi à Bordeaux | Tarif Immédiat — Taxi Bordeaux Solution',
  description: 'Réservez votre taxi à Bordeaux en ligne : calculez votre tarif en temps réel, aéroport, gare, centre-ville. Service disponible 24h/24 — 7j/7.',
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/booking',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/booking',
      'x-default': 'https://www.taxibordeauxsolution.fr/booking',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
