import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos Services Taxi à Bordeaux | Aéroport, Gare, Longue Distance — Taxi Bordeaux Solution',
  description: 'Découvrez tous les services de Taxi Bordeaux Solution : transfert aéroport, taxi gare, transport médical, longue distance. Tarifs réglementés, 24h/24.',
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/services',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/services',
      'x-default': 'https://www.taxibordeauxsolution.fr/services',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
