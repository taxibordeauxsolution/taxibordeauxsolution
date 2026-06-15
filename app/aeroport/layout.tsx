import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taxi Bordeaux Aéroport Mérignac | Taxi Mérignac 24h/24 — Tarif Officiel',
  description: 'Taxi Bordeaux aéroport Mérignac : prise en charge Hall A, suivi des vols, tarif réglementé Préfecture de Gironde. CB acceptée. Réservez en ligne 24h/24.',
  keywords: 'taxi bordeaux aéroport, taxi mérignac, taxi aéroport bordeaux mérignac, transfert aéroport bordeaux, taxi bordeaux-mérignac, prise en charge hall a',
  openGraph: {
    title: 'Taxi Bordeaux Aéroport Mérignac — Tarif Officiel, 24h/24',
    description: 'Prise en charge Hall A, suivi des vols en temps réel. Tarif réglementé Préfecture de Gironde. Réservez votre taxi aéroport Bordeaux maintenant.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.taxibordeauxsolution.fr/aeroport',
    siteName: 'Taxi Bordeaux Solution',
    images: [{
      url: 'https://www.taxibordeauxsolution.fr/images/hero/taxi-sign-sunset.jpg',
      width: 1200,
      height: 630,
      alt: 'Taxi Bordeaux Aéroport Mérignac',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taxi Bordeaux Aéroport Mérignac',
    description: 'Prise en charge Hall A, suivi des vols. Tarif réglementé 24h/24.',
    images: ['https://www.taxibordeauxsolution.fr/images/hero/taxi-sign-sunset.jpg'],
  },
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/aeroport',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/aeroport',
      'x-default': 'https://www.taxibordeauxsolution.fr/aeroport',
    },
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TaxiService',
            name: 'Taxi Bordeaux Aéroport Mérignac',
            description: 'Service taxi professionnel depuis et vers l\'aéroport Bordeaux-Mérignac. Station officielle Hall A, suivi des vols, tarif réglementé.',
            url: 'https://www.taxibordeauxsolution.fr/aeroport',
            telephone: '+33554543466',
            serviceType: 'Transfert aéroport',
            areaServed: { '@type': 'Airport', name: 'Aéroport de Bordeaux-Mérignac', iataCode: 'BOD' },
            provider: {
              '@type': 'LocalBusiness',
              name: 'Taxi Bordeaux Solution',
              telephone: '+33554543466',
              url: 'https://www.taxibordeauxsolution.fr',
            },
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
              opens: '00:00',
              closes: '23:59',
            },
          }),
        }}
      />
      {children}
    </>
  )
}
