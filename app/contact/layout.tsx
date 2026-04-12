import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://taxibordeauxsolution.fr/contact',
    languages: {
      'fr': 'https://taxibordeauxsolution.fr/contact',
      'x-default': 'https://taxibordeauxsolution.fr/contact',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
