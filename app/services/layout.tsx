import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nos Services Taxi à Bordeaux | Aéroport, Gare, Longue Distance — Taxi Bordeaux Solution',
  description: 'Découvrez tous les services de Taxi Bordeaux Solution : transfert aéroport Mérignac, taxi gare Saint-Jean, transport médical, longue distance. Tarifs réglementés, 24h/24.',
  openGraph: {
    title: 'Services Taxi Bordeaux — Aéroport, Gare, Longue Distance',
    description: 'Transfert aéroport, taxi gare, transport professionnel et longue distance. Tarifs réglementés, disponible 24h/24.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.taxibordeauxsolution.fr/services',
    siteName: 'Taxi Bordeaux Solution',
    images: [{
      url: 'https://www.taxibordeauxsolution.fr/images/hero/taxi-sign-sunset.jpg',
      width: 1200,
      height: 630,
      alt: 'Services Taxi Bordeaux Solution',
    }],
  },
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/services',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/services',
      'x-default': 'https://www.taxibordeauxsolution.fr/services',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
