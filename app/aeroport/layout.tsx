import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taxi Bordeaux Aéroport Mérignac | Taxi Mérignac 24h/24 — Tarif Officiel',
  description: 'Taxi Bordeaux aéroport Mérignac : prise en charge Hall A, suivi des vols, tarif réglementé Préfecture de Gironde. CB acceptée. Réservez au 06 67 23 78 22.',
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
