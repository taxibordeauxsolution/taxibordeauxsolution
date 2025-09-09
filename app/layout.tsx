import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taxi Bordeaux 🚖 Service 5-10min | LA Solution Transport Bordeaux 24h/24',
  description: 'Taxi Bordeaux professionnel - Prise en charge 5-10 minutes partout à Bordeaux. Aéroport Mérignac, Gare Saint-Jean, centre-ville. Réservation taxi Bordeaux 24h/24 7j/7. Service premium, tarifs réglementés.',
  keywords: 'taxi bordeaux, taxi bordeaux 24h, réserver taxi bordeaux, taxi aéroport bordeaux, taxi gare bordeaux, taxi bordeaux pas cher, taxi bordeaux centre, transport bordeaux, chauffeur bordeaux, taxi bordeaux mérignac, taxi bordeaux saint jean, taxi bordeaux nuit, appeler taxi bordeaux, numero taxi bordeaux, taxi bordeaux rapide',
  
  // Open Graph pour réseaux sociaux
  openGraph: {
    title: 'Taxi Bordeaux Solution - Prise en charge 5-10 minutes',
    description: 'LA solution transport à Bordeaux. Service taxi professionnel 24h/24, prise en charge rapide dans toute la métropole bordelaise.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://taxibordeauxsolution.fr',
    siteName: 'Taxi Bordeaux Solution',
    images: [
      {
        url: 'https://taxibordeauxsolution.fr/images/taxi-bordeaux-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Taxi Bordeaux Solution - Service professionnel',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Taxi Bordeaux Solution - Service 5-10 minutes',
    description: 'Taxi professionnel à Bordeaux. Prise en charge rapide 24h/24 dans toute la métropole.',
    images: ['https://taxibordeauxsolution.fr/images/taxi-bordeaux-twitter.jpg'],
  },

  // SEO Avancé
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Géolocalisation
  other: {
    'geo.region': 'FR-33',
    'geo.placename': 'Bordeaux',
    'geo.position': '44.8378;-0.5792',
    'ICBM': '44.8378, -0.5792',
  },

  // Données structurées (Schema.org)
  alternates: {
    canonical: 'https://taxibordeauxsolution.fr',
  },

  // Auteur et copyright
  authors: [{ name: 'Taxi Bordeaux Solution' }],
  publisher: 'Taxi Bordeaux Solution',
  category: 'Transport',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <head>
        {/* Schema.org données structurées */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://taxibordeauxsolution.fr",
              "name": "Taxi Bordeaux Solution",
              "alternateName": "LA Solution Transport Bordeaux",
              "description": "Service taxi professionnel à Bordeaux. Prise en charge 5-10 minutes, disponible 24h/24 dans toute la métropole bordelaise.",
              "url": "https://taxibordeauxsolution.fr",
              "telephone": "+33667237822",
              "email": "contact@taxibordeauxsolution.fr",
              "image": "https://taxibordeauxsolution.fr/images/taxi-bordeaux.jpg",
              "logo": "https://taxibordeauxsolution.fr/images/logo/Logo Taxi Bordeaux Solution.png.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bordeaux",
                "addressRegion": "Nouvelle-Aquitaine",
                "postalCode": "33000",
                "addressCountry": "FR",
                "streetAddress": "Bordeaux et métropole"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 44.8378,
                "longitude": -0.5792
              },
              "areaServed": [
                {
                  "@type": "City",
                  "name": "Bordeaux"
                },
                {
                  "@type": "City", 
                  "name": "Mérignac"
                },
                {
                  "@type": "City",
                  "name": "Pessac" 
                },
                {
                  "@type": "City",
                  "name": "Talence"
                }
              ],
              "serviceType": "Taxi Service",
              "priceRange": "€€",
              "openingHours": "Mo-Su 00:00-23:59",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Services Taxi Bordeaux",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Taxi Aéroport Bordeaux Mérignac",
                      "description": "Transport aéroport Bordeaux-Mérignac"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Taxi Gare Saint-Jean Bordeaux",
                      "description": "Transport gare SNCF Saint-Jean"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "Taxi Bordeaux Centre-Ville",
                      "description": "Courses urbaines dans Bordeaux"
                    }
                  }
                ]
              },
              "sameAs": [
                "https://www.google.com/maps/place/Taxi+Bordeaux+Solution"
              ],
              "review": {
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": "Client Satisfait"
                },
                "reviewBody": "Service taxi excellent à Bordeaux, prise en charge très rapide et chauffeur professionnel."
              },
              "aggregateRating": {
                "@type": "AggregateRating", 
                "ratingValue": "4.9",
                "reviewCount": "150",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />

        {/* Balises SEO additionnelles */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Préchargement des ressources critiques */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Hreflang pour le référencement international */}
        <link rel="alternate" hrefLang="fr" href="https://taxibordeauxsolution.fr" />
        <link rel="alternate" hrefLang="fr-FR" href="https://taxibordeauxsolution.fr" />
      </head>
      
      <body className={inter.className} suppressHydrationWarning={true}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}