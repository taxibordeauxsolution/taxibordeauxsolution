import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Taxi Bordeaux Solution | Réponse Rapide',
  description: 'Contactez Taxi Bordeaux Solution : formulaire en ligne, réponse rapide. Disponible 24h/24, 7j/7.',
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/contact',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/contact',
      'x-default': 'https://www.taxibordeauxsolution.fr/contact',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
