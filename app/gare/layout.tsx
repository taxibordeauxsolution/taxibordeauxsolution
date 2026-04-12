import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://taxibordeauxsolution.fr/gare',
    languages: {
      'fr': 'https://taxibordeauxsolution.fr/gare',
      'x-default': 'https://taxibordeauxsolution.fr/gare',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
