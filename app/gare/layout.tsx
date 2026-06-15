import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taxi Bordeaux Gare Saint-Jean | Réservation Taxi Bordeaux 24h/24',
  description: 'Réservez votre taxi Bordeaux Gare Saint-Jean en quelques secondes. Taxi bordelais professionnel disponible 24h/24. Tarifs réglementés, prise en charge directe sur le parvis.',
  keywords: 'taxi bordeaux gare, taxi gare saint-jean bordeaux, taxi bordeaux saint jean, réserver taxi bordeaux gare, taxi bordelais, transfert gare bordeaux',
  openGraph: {
    title: 'Taxi Bordeaux Gare Saint-Jean — 24h/24, Tarif Réglementé',
    description: 'Prise en charge directe sur le parvis de la Gare Saint-Jean. Taxi bordelais professionnel disponible 24h/24.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.taxibordeauxsolution.fr/gare',
    siteName: 'Taxi Bordeaux Solution',
    images: [{
      url: 'https://www.taxibordeauxsolution.fr/images/hero/taxi-sign-sunset.jpg',
      width: 1200,
      height: 630,
      alt: 'Taxi Bordeaux Gare Saint-Jean',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taxi Bordeaux Gare Saint-Jean',
    description: 'Prise en charge directe parvis Gare Saint-Jean. Taxi bordelais 24h/24.',
    images: ['https://www.taxibordeauxsolution.fr/images/hero/taxi-sign-sunset.jpg'],
  },
  alternates: {
    canonical: 'https://www.taxibordeauxsolution.fr/gare',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr/gare',
      'x-default': 'https://www.taxibordeauxsolution.fr/gare',
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
            name: 'Taxi Bordeaux Gare Saint-Jean',
            description: 'Service taxi professionnel depuis et vers la Gare SNCF Bordeaux Saint-Jean. Prise en charge directe sur le parvis, tarif réglementé.',
            url: 'https://www.taxibordeauxsolution.fr/gare',
            telephone: '+33554543466',
            serviceType: 'Transfert gare',
            areaServed: { '@type': 'TrainStation', name: 'Gare de Bordeaux Saint-Jean' },
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
