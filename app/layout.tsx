import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import CookieBanner from './components/CookieBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taxi Bordeaux | Service Rapide 24h/24 — Taxi Bordeaux Solution',
  description: 'Taxi Bordeaux professionnel - Prise en charge rapide partout à Bordeaux. Aéroport Mérignac, Gare Saint-Jean, centre-ville. Réservation taxi Bordeaux 24h/24 7j/7. Service premium, tarifs réglementés.',
  keywords: 'taxi bordeaux, taxi bordeaux 24h, réserver taxi bordeaux, taxi aéroport bordeaux, taxi gare bordeaux, taxi bordeaux pas cher, taxi bordeaux centre, transport bordeaux, chauffeur bordeaux, taxi bordeaux mérignac, taxi bordeaux saint jean, taxi bordeaux nuit, appeler taxi bordeaux, numero taxi bordeaux, taxi bordeaux rapide',
  
  // Open Graph pour réseaux sociaux
  openGraph: {
    title: 'Taxi Bordeaux Solution - Prise en charge rapide',
    description: 'LA solution transport à Bordeaux. Service taxi professionnel 24h/24, prise en charge rapide dans toute la métropole bordelaise.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.taxibordeauxsolution.fr',
    siteName: 'Taxi Bordeaux Solution',
    images: [
      {
        url: 'https://www.taxibordeauxsolution.fr/images/taxi-bordeaux-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Taxi Bordeaux Solution - Service professionnel',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Taxi Bordeaux Solution - Service rapide',
    description: 'Taxi professionnel à Bordeaux. Prise en charge rapide 24h/24 dans toute la métropole.',
    images: ['https://www.taxibordeauxsolution.fr/images/taxi-bordeaux-twitter.jpg'],
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
    canonical: 'https://www.taxibordeauxsolution.fr',
    languages: {
      'fr': 'https://www.taxibordeauxsolution.fr',
      'x-default': 'https://www.taxibordeauxsolution.fr',
    },
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
              "@type": "TaxiService",
              "@id": "https://www.taxibordeauxsolution.fr/#taxiservice",
              "name": "Taxi Bordeaux Solution",
              "description": "Service taxi professionnel à Bordeaux 24h/24. Transferts aéroport Mérignac, gare Saint-Jean, toute la métropole bordelaise. Tarifs réglementés Préfecture de Gironde.",
              "url": "https://www.taxibordeauxsolution.fr",
              "telephone": "+33667237822",
              "email": "contact@taxibordeauxsolution.fr",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bordeaux",
                "addressRegion": "Nouvelle-Aquitaine",
                "postalCode": "33000",
                "addressCountry": "FR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 44.8378,
                "longitude": -0.5792
              },
              "areaServed": [
                { "@type": "City", "name": "Bordeaux" },
                { "@type": "City", "name": "Mérignac" },
                { "@type": "City", "name": "Pessac" },
                { "@type": "City", "name": "Talence" },
                { "@type": "City", "name": "Le Bouscat" },
                { "@type": "City", "name": "Eysines" }
              ],
              "priceRange": "€€",
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Services Taxi Bordeaux",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "TaxiService",
                      "name": "Taxi Aéroport Bordeaux-Mérignac",
                      "description": "Transfert taxi aéroport Bordeaux-Mérignac, tarif réglementé, disponible 24h/24."
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "TaxiService",
                      "name": "Taxi Gare Saint-Jean Bordeaux",
                      "description": "Prise en charge gare SNCF Saint-Jean Bordeaux, station officielle parvis."
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "TaxiService",
                      "name": "Taxi Bordeaux Centre-Ville",
                      "description": "Courses urbaines dans Bordeaux et toute la métropole bordelaise."
                    }
                  }
                ]
              }
            })
          }}
        />

        {/* Balises SEO additionnelles */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Preconnect origines tierces critiques */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Google Consent Mode v2 — doit être déclaré AVANT le tag Google (obligatoire EU/RGPD) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'wait_for_update': 500
              });
              gtag('set', 'ads_data_redaction', true);
              gtag('set', 'url_passthrough', true);
            `
          }}
        />

        {/* Restaurer le consentement sauvegardé AVANT de charger gtag */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var consent = localStorage.getItem('cookie_consent');
                if (consent === 'granted') {
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                  });
                }
              })();
            `
          }}
        />

      </head>

      <body className={inter.className} suppressHydrationWarning={true}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <CookieBanner />

        {/* Google Tag (gtag.js) — GA4 + Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16903067402"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XLRN3B9S2D', { 'send_page_view': true });
            gtag('config', 'AW-16903067402', { 'send_page_view': false });
          `}
        </Script>

        {/* Suivi conversions — clics téléphone (tous les liens tel:) */}
        <Script id="track-phone-clicks" strategy="afterInteractive">
          {`
            document.addEventListener('click', function(e) {
              var el = e.target.closest('a[href^="tel:"]');
              if (el && window.gtag) {
                gtag('event', 'conversion', {
                  send_to: 'AW-16903067402/FgrqCM28x50cEIqugfw-',
                  event_category: 'contact',
                  event_label: 'appel_telephone',
                  value: 1.0,
                  currency: 'EUR'
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  )
}