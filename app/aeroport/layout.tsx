import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://taxibordeauxsolution.fr/aeroport',
    languages: {
      'fr': 'https://taxibordeauxsolution.fr/aeroport',
      'x-default': 'https://taxibordeauxsolution.fr/aeroport',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
