'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Clock, Users, Briefcase, Euro, Phone, Mail, Car, Navigation, CheckCircle, Globe, Map, Route, Loader2, ArrowRight } from 'lucide-react'
import type { Coordinates } from '../../types/booking'

// Configuration API
const API_BASE_URL = 'http://localhost:3002/api'
const GOOGLE_MAPS_API_KEY = 'AIzaSyCarUqBqL2yuEy36eOw4JNatmclfOhOGs0'

const TaxiBookingSimple = () => {
  // États principaux
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('fr')
  const [map, setMap] = useState<any>(null)
  const [directionsService, setDirectionsService] = useState<any>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null)
  const [mapVisible, setMapVisible] = useState(false)
  const [error, setError] = useState('')

  // Données du trajet avec valeurs par défaut sécurisées
  const [tripData, setTripData] = useState<{
    from: string;
    to: string;
    fromCoords: Coordinates | null;
    toCoords: Coordinates | null;
    distance: number;
    duration: number;
    price: number;
  }>({
    from: '',
    to: '',
    fromCoords: null,
    toCoords: null,
    distance: 0,
    duration: 0,
    price: 0
  })

  // Données de réservation
  const [bookingData, setBookingData] = useState({
    passengers: 1,
    luggage: 0,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupDate: '',
    pickupTime: ''
  })

  // Références
  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Traductions
  const translations = {
    fr: {
      title: "Taxi Bordeaux Solution",
      subtitle: "Réservation en ligne • Service 24h/24",
      step1Title: "Où souhaitez-vous aller ?",
      fromPlaceholder: "Départ (ex: Aéroport, Gare...)",
      toPlaceholder: "Destination (ex: Hôtel, Place...)",
      fromLabel: "Point de départ",
      toLabel: "Destination",
      calculatingRoute: "Calcul de l'itinéraire...",
      showMap: "Afficher la carte",
      hideMap: "Masquer la carte",
      distance: "Distance",
      duration: "Durée estimée",
      minutes: "minutes",
      continue: "Continuer",
      step2Title: "Détails de votre réservation",
      passengers: "Nombre de passagers",
      luggage: "Nombre de bagages",
      pickupDate: "Date de prise en charge",
      pickupTime: "Heure de prise en charge",
      estimatedPrice: "Prix estimé",
      step3Title: "Vos coordonnées",
      fullName: "Nom complet",
      phone: "Téléphone",
      email: "Email (optionnel)",
      confirmBooking: "Confirmer la réservation",
      bookingConfirmed: "Réservation confirmée !",
      newBooking: "Nouvelle réservation",
      back: "Retour"
    }
  }

  const t = (key: string) => translations[language as keyof typeof translations]?.[key as keyof typeof translations.fr] || key

  // Initialisation Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMaps()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMaps
      document.head.appendChild(script)
    }

    const initializeMaps = () => {
      if (window.google && window.google.maps && mapRef.current) {
        const google = window.google

        // Carte
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 44.8378, lng: -0.5792 },
          zoom: 12
        })
        setMap(mapInstance)

        // Services
        setDirectionsService(new google.maps.DirectionsService())
        setDirectionsRenderer(new google.maps.DirectionsRenderer({ map: mapInstance }))

        // Autocomplete
        if (fromInputRef.current) {
          const autocompleteFrom = new google.maps.places.Autocomplete(fromInputRef.current, {
            componentRestrictions: { country: 'fr' }
          })
          
          autocompleteFrom.addListener('place_changed', () => {
            const place = autocompleteFrom.getPlace()
            if (place.geometry) {
              setTripData(prev => ({
                ...prev,
                from: place.formatted_address || '',
                fromCoords: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              }))
            }
          })
        }

        if (toInputRef.current) {
          const autocompleteTo = new google.maps.places.Autocomplete(toInputRef.current, {
            componentRestrictions: { country: 'fr' }
          })
          
          autocompleteTo.addListener('place_changed', () => {
            const place = autocompleteTo.getPlace()
            if (place.geometry) {
              setTripData(prev => ({
                ...prev,
                to: place.formatted_address || '',
                toCoords: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              }))
            }
          })
        }
      }
    }

    loadGoogleMaps()
  }, [])

  // Fonction pour déterminer si c'est un tarif de nuit
  const isNightRate = (time: string) => {
    if (!time) return false
    const hour = parseInt(time.split(':')[0])
    return hour >= 21 || hour < 7
  }

  // Fonction pour calculer le prix selon l'heure
  const calculatePrice = useCallback((distance: number, pickupTime: string) => {
    const baseFare = 2.80
    const dayRate = 2.12
    const nightRate = 3.18
    
    const rate = isNightRate(pickupTime) ? nightRate : dayRate
    const price = baseFare + (distance * rate)
    
    return Math.max(price, 7.30) // Prix minimum
  }, [])

  const calculateRoute = useCallback(() => {
    if (!tripData.fromCoords || !tripData.toCoords || !directionsService || !directionsRenderer) return

    setLoading(true)
    
    directionsService.route({
      origin: tripData.fromCoords,
      destination: tripData.toCoords,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: false, // Autorise autoroutes pour rapidité
      avoidTolls: false,    // Autorise péages pour rapidité
      unitSystem: window.google.maps.UnitSystem.METRIC,
      optimizeWaypoints: true, // Optimise l'itinéraire
      provideRouteAlternatives: false, // Route la plus rapide uniquement
      region: 'FR' // Optimisation locale France
    }, (result: any, status: string) => {
      setLoading(false)
      
      if (status === 'OK' && result?.routes?.[0]?.legs?.[0]) {
        directionsRenderer.setDirections(result)
        
        const leg = result.routes[0].legs[0]
        const distance = (leg.distance?.value || 0) / 1000
        const duration = (leg.duration?.value || 0) / 60
        const price = calculatePrice(distance, bookingData.pickupTime)
        
        setTripData(prev => ({
          ...prev,
          distance: distance,
          duration: duration,
          price: price
        }))
        
        setMapVisible(true)
      } else {
        setError('Impossible de calculer l&apos;itinéraire')
      }
    })
  }, [tripData.fromCoords, tripData.toCoords, directionsService, directionsRenderer, bookingData.pickupTime, calculatePrice])

  // Calcul itinéraire
  useEffect(() => {
    if (tripData.fromCoords && tripData.toCoords && directionsService && directionsRenderer) {
      calculateRoute()
    }
  }, [tripData.fromCoords, tripData.toCoords, directionsService, directionsRenderer, calculateRoute])

  // Recalcul du prix quand l'heure change
  useEffect(() => {
    if (tripData.distance > 0) {
      const newPrice = calculatePrice(tripData.distance, bookingData.pickupTime)
      setTripData(prev => ({ ...prev, price: newPrice }))
    }
  }, [bookingData.pickupTime, tripData.distance, calculatePrice])

  const handleBookingChange = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  // Soumission de la réservation
  const submitReservation = async () => {
    setLoading(true)
    setError('')

    const reservationData = {
      trip: {
        from: {
          address: tripData.from,
          coordinates: tripData.fromCoords
        },
        to: {
          address: tripData.to,
          coordinates: tripData.toCoords
        }
      },
      customer: {
        name: bookingData.customerName,
        phone: bookingData.customerPhone,
        email: bookingData.customerEmail
      },
      booking: {
        passengers: bookingData.passengers,
        luggage: bookingData.luggage,
        isImmediate: false,
        scheduledDateTime: new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}:00`).toISOString(),
        preferredLanguage: 'fr'
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Réservation envoyée:', data)
        setStep(4) // Aller à la confirmation
      } else {
        setError('Erreur lors de l\'envoi de la réservation')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      // Même si l'API échoue, on passe à l'étape suivante pour la démo
      console.log('📧 Réservation (mode démo):', reservationData)
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  // Interface étape 1
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step1Title')}</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-green-500" />
              {t('fromLabel')}
            </label>
            <input
              ref={fromInputRef}
              type="text"
              placeholder={t('fromPlaceholder')}
              value={tripData.from}
              onChange={(e) => setTripData(prev => ({ ...prev, from: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-red-500" />
              {t('toLabel')}
            </label>
            <input
              ref={toInputRef}
              type="text"
              placeholder={t('toPlaceholder')}
              value={tripData.to}
              onChange={(e) => setTripData(prev => ({ ...prev, to: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                {t('pickupDate')}
              </label>
              <input
                type="date"
                value={bookingData.pickupDate}
                onChange={(e) => handleBookingChange('pickupDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                {t('pickupTime')}
              </label>
              <input
                type="time"
                value={bookingData.pickupTime}
                onChange={(e) => handleBookingChange('pickupTime', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(tripData.fromCoords || tripData.toCoords) && (
            <button
              onClick={() => setMapVisible(!mapVisible)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
            >
              <Map className="w-4 h-4 mr-2 inline" />
              {mapVisible ? t('hideMap') : t('showMap')}
            </button>
          )}

          {loading && (
            <div className="text-center py-4">
              <Loader2 className="animate-spin h-6 w-6 text-blue-600 mx-auto" />
              <p className="mt-2">{t('calculatingRoute')}</p>
            </div>
          )}

          {tripData.distance > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Itinéraire calculé</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('distance')}:</span>
                  <div className="font-semibold text-lg">{tripData.distance.toFixed(1)} km</div>
                </div>
                <div>
                  <span className="text-gray-600">{t('duration')}:</span>
                  <div className="font-semibold text-lg">{Math.round(tripData.duration)} {t('minutes')}</div>
                </div>
              </div>
              
              {tripData.price > 0 && bookingData.pickupDate && bookingData.pickupTime && (
                <div className="mt-4 pt-4 border-t border-blue-200 text-center">
                  <span className="text-gray-600 text-sm">{t('estimatedPrice')} :</span>
                  <div className="text-2xl font-bold text-blue-700">
                    {tripData.price.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {isNightRate(bookingData.pickupTime) ? 
                      '🌙 Tarif nuit (21h-7h) : 3,18€/km' : 
                      '☀️ Tarif jour (7h-21h) : 2,12€/km'
                    }
                  </div>
                </div>
              )}

              {tripData.distance > 0 && (!bookingData.pickupDate || !bookingData.pickupTime) && (
                <div className="mt-4 pt-4 border-t border-blue-200 text-center">
                  <div className="text-sm text-gray-600">
                    📅 Sélectionnez une date et une heure pour voir le prix
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`${mapVisible ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 h-96">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!tripData.fromCoords || !tripData.toCoords || !bookingData.pickupDate || !bookingData.pickupTime || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        <Navigation className="w-5 h-5 mr-2 inline" />
        {t('continue')}
      </button>
    </div>
  )

  // Interface étape 2
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step2Title')}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              {t('passengers')}
            </label>
            <select
              value={bookingData.passengers}
              onChange={(e) => handleBookingChange('passengers', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {[1,2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num}>{num} passager{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="inline w-4 h-4 mr-1" />
              {t('luggage')}
            </label>
            <select
              value={bookingData.luggage}
              onChange={(e) => handleBookingChange('luggage', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {[0,1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num} bagage{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-4">
            <Euro className="w-5 h-5 mr-2 inline" />
            {t('estimatedPrice')}
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">
              {tripData.price.toFixed(2)}€
            </div>
            <div className="text-sm text-green-600 mt-2">
              {tripData.distance.toFixed(1)} km • {Math.round(tripData.duration)} min
            </div>
            {bookingData.pickupDate && bookingData.pickupTime && (
              <div className="text-xs text-green-500 mt-1">
                {isNightRate(bookingData.pickupTime) ? 
                  '🌙 Tarif nuit (21h-7h)' : 
                  '☀️ Tarif jour (7h-21h)'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300"
        >
          {t('back')}
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
        >
          {t('continue')}
        </button>
      </div>
    </div>
  )

  // Interface étape 3
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step3Title')}</h2>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder={t('fullName')}
          value={bookingData.customerName}
          onChange={(e) => handleBookingChange('customerName', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        
        <input
          type="tel"
          placeholder={t('phone')}
          value={bookingData.customerPhone}
          onChange={(e) => handleBookingChange('customerPhone', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        
        <input
          type="email"
          placeholder={t('email')}
          value={bookingData.customerEmail}
          onChange={(e) => handleBookingChange('customerEmail', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300"
        >
          {t('back')}
        </button>
        <button
          onClick={submitReservation}
          disabled={!bookingData.customerName || !bookingData.customerPhone || !bookingData.pickupDate || !bookingData.pickupTime || loading}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Envoi en cours...
            </>
          ) : (
            t('confirmBooking')
          )}
        </button>
      </div>
    </div>
  )

  // Interface étape 4
  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{t('bookingConfirmed')}</h2>
      
      <div className="bg-white border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Détails de votre réservation</h3>
        <div className="space-y-2 text-sm text-left">
          <div><strong>Numéro :</strong> TX-{Date.now().toString().slice(-6)}</div>
          <div><strong>Nom :</strong> {bookingData.customerName}</div>
          <div><strong>Trajet :</strong> {tripData.from.split(',')[0]} → {tripData.to.split(',')[0]}</div>
          <div><strong>Prix :</strong> {tripData.price.toFixed(2)}€</div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700"
      >
        {t('newBooking')}
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('title')}</h1>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && <div className={`w-8 h-0.5 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  )
}

export default TaxiBookingSimple