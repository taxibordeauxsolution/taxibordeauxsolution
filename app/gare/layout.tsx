import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/gare',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/gare',
      'x-default': 'https://www.taxibordeauxsolution.fr/gare',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
