import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales — Taxi Bordeaux Solution',
  description: 'Mentions légales du site Taxi Bordeaux Solution : informations sur l\'éditeur, l\'hébergeur, la propriété intellectuelle et la protection des données.',
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/mentions-legales',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/mentions-legales',
      'x-default': 'https://www.taxibordeauxsolution.fr/mentions-legales',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
