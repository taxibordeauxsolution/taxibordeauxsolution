import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Taxi Bordeaux Solution | Réponse sous 2h',
  description: 'Contactez Taxi Bordeaux Solution : formulaire en ligne, réponse garantie sous 2h. Disponible 24h/24 au 06 67 23 78 22 pour toute demande urgente.',
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
