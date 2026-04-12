import type { Metadata } from 'next'

export const metadata: Metadata = {
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
