import TaxiBookingWithBackend from '../components/TaxiBookingWithBackend'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réservation Taxi Bordeaux avec Carte Interactive | Service 24h/24',
  description: 'Réservez votre taxi à Bordeaux avec notre interface avancée incluant carte Google Maps interactive, calcul d\'itinéraire temps réel et estimation de prix automatique.',
  keywords: 'réservation taxi bordeaux, carte interactive, google maps, taxi bordeaux en temps réel, calcul itinéraire, estimation prix taxi',
  openGraph: {
    title: 'Réservation Taxi Bordeaux avec Carte Interactive',
    description: 'Interface de réservation complète avec Google Maps, calcul d\'itinéraire en temps réel et service multilingue 24h/24.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Taxi Bordeaux Solution'
  }
}

export default function BookingPage() {
  return (
    <div className="min-h-screen">
      <TaxiBookingWithBackend />
    </div>
  )
}