import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Taxi Bordeaux Solution | Réponse Rapide',
  description: 'Contactez Taxi Bordeaux Solution : formulaire en ligne, réponse rapide. Disponible 24h/24, 7j/7. Téléphone : +33 6 67 23 78 22.',
  openGraph: {
    title: 'Contactez Taxi Bordeaux Solution',
    description: 'Formulaire de contact ou téléphone direct. Service disponible 24h/24, 7j/7.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.taxibordeauxsolution.fr/contact',
    siteName: 'Taxi Bordeaux Solution',
    images: [{
      url: 'https://www.taxibordeauxsolution.fr/images/hero/taxi-sign-sunset.jpg',
      width: 1200,
      height: 630,
      alt: 'Contacter Taxi Bordeaux Solution',
    }],
  },
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
