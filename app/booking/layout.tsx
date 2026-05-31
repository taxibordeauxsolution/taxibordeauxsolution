import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réservation Taxi Bordeaux en Ligne | Tarif Immédiat — Taxi Bordeaux Solution',
  description: 'Réservez votre taxi à Bordeaux en ligne : calculez votre tarif en temps réel, aéroport, gare, centre-ville. Service disponible 24h/24 — 7j/7. Paiement à bord.',
  openGraph: {
    title: 'Réservation Taxi Bordeaux en Ligne — Tarif Immédiat',
    description: 'Calculez et réservez votre taxi Bordeaux en ligne. Tarif en temps réel, service 24h/24, paiement à bord.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.taxibordeauxsolution.fr/booking',
    siteName: 'Taxi Bordeaux Solution',
    images: [{
      url: 'https://www.taxibordeauxsolution.fr/images/hero/taxi-sign-sunset.jpg',
      width: 1200,
      height: 630,
      alt: 'Réservation Taxi Bordeaux en Ligne',
    }],
  },
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
