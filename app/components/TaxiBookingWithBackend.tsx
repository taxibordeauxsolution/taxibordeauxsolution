'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Clock, Users, Briefcase, Euro, Calendar, Phone, Mail, Car, Navigation, CheckCircle, AlertCircle, Globe, Map, Route, Loader2, ArrowRight } from 'lucide-react'
import type { TripData, BookingData, ReservationData } from '../../types/booking'

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
const GOOGLE_MAPS_API_KEY = 'AIzaSyCarUqBqL2yuEy36eOw4JNatmclfOhOGs0'

const TaxiBookingWithBackend = () => {
  // États principaux
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('fr')
  const [maps, setMaps] = useState<any>(null)
  const [map, setMap] = useState<any>(null)
  const [directionsService, setDirectionsService] = useState<any>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null)
  const [autocompleteFrom, setAutocompleteFrom] = useState<any>(null)
  const [autocompleteTo, setAutocompleteTo] = useState<any>(null)
  const [mapVisible, setMapVisible] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Données du trajet
  const [tripData, setTripData] = useState<TripData>({
    from: '',
    to: '',
    fromCoords: null,
    toCoords: null,
    distance: 0,
    duration: 0,
    price: 0,
    priceDetails: {},
    routeInfo: null,
    serviceAreaValidation: { valid: true }
  })

  // Données de réservation
  const [bookingData, setBookingData] = useState<BookingData & { isImmediate: boolean }>({
    passengers: 1,
    luggage: 0,
    departureDate: '',
    departureTime: '',
    isImmediate: true,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    language: 'fr'
  })

  // Réservation créée
  const [reservation, setReservation] = useState<ReservationData | null>(null)

  // Références
  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Dictionnaire de traductions complet
  const translations = {
    fr: {
      title: "Taxi Bordeaux Solution",
      subtitle: "Réservation en ligne • Service 24h/24",
      step1Title: "Où souhaitez-vous aller ?",
      step1Subtitle: "Entrez votre point de départ et votre destination",
      fromPlaceholder: "Adresse de départ (ex: Place de la Comédie, Bordeaux)",
      toPlaceholder: "Adresse de destination (ex: Aéroport Bordeaux-Mérignac)",
      fromLabel: "Point de départ",
      toLabel: "Destination",
      calculatingRoute: "Calcul de l'itinéraire...",
      routeCalculated: "Itinéraire calculé",
      showMap: "Afficher la carte",
      hideMap: "Masquer la carte",
      distance: "Distance",
      duration: "Durée estimée",
      minutes: "minutes",
      continue: "Continuer",
      step2Title: "Détails de votre réservation",
      passengers: "Nombre de passagers",
      luggage: "Nombre de bagages",
      priceEstimate: "Estimation du prix",
      totalPrice: "Prix Total",
      step3Title: "Vos coordonnées",
      fullName: "Nom complet",
      phone: "Téléphone",
      email: "Email (optionnel)",
      notes: "Informations complémentaires",
      confirmBooking: "Confirmer la réservation",
      bookingConfirmed: "Réservation confirmée !",
      newBooking: "Nouvelle réservation",
      back: "Retour",
      loading: "Chargement...",
      error: "Erreur",
      outOfServiceArea: "Zone hors service",
      estimatedPrice: "Prix estimé",
      bookingDetails: "Détails de votre réservation",
      reservationNumber: "Numéro de réservation",
      nextSteps: "Prochaines étapes"
    },
    en: {
      title: "Taxi Bordeaux Solution", 
      subtitle: "Online booking • 24/7 service",
      step1Title: "Where would you like to go?",
      step1Subtitle: "Enter your pickup and destination address",
      fromPlaceholder: "Pickup address (e.g., Place de la Comédie, Bordeaux)",
      toPlaceholder: "Destination address (e.g., Bordeaux-Mérignac Airport)",
      fromLabel: "Pickup point",
      toLabel: "Destination",
      calculatingRoute: "Calculating route...",
      routeCalculated: "Route calculated",
      showMap: "Show map",
      hideMap: "Hide map",
      distance: "Distance",
      duration: "Estimated time",
      minutes: "minutes",
      continue: "Continue",
      step2Title: "Your booking details",
      passengers: "Number of passengers",
      luggage: "Number of bags",
      priceEstimate: "Price estimate",
      totalPrice: "Total Price",
      step3Title: "Your details",
      fullName: "Full name",
      phone: "Phone",
      email: "Email (optional)",
      notes: "Additional information",
      confirmBooking: "Confirm booking",
      bookingConfirmed: "Booking confirmed!",
      newBooking: "New booking",
      back: "Back",
      loading: "Loading...",
      error: "Error",
      outOfServiceArea: "Out of service area",
      estimatedPrice: "Estimated price",
      bookingDetails: "Your booking details",
      reservationNumber: "Reservation number",
      nextSteps: "Next steps"
    },
    es: {
      title: "Taxi Bordeaux Solution",
      subtitle: "Reserva online • Servicio 24h/24", 
      step1Title: "¿A dónde quiere ir?",
      step1Subtitle: "Introduzca su punto de recogida y destino",
      fromPlaceholder: "Dirección de recogida (ej: Place de la Comédie, Bordeaux)",
      toPlaceholder: "Dirección de destino (ej: Aeropuerto Bordeaux-Mérignac)",
      fromLabel: "Punto de recogida", 
      toLabel: "Destino",
      calculatingRoute: "Calculando ruta...",
      routeCalculated: "Ruta calculada",
      showMap: "Mostrar mapa",
      hideMap: "Ocultar mapa",
      distance: "Distancia",
      duration: "Tiempo estimado",
      minutes: "minutos",
      continue: "Continuar",
      step2Title: "Detalles de su reserva",
      passengers: "Número de pasajeros",
      luggage: "Número de equipajes",
      priceEstimate: "Estimación del precio",
      totalPrice: "Precio Total",
      step3Title: "Sus datos",
      fullName: "Nombre completo",
      phone: "Teléfono",
      email: "Email (opcional)",
      notes: "Información adicional",
      confirmBooking: "Confirmar reserva",
      bookingConfirmed: "¡Reserva confirmada!",
      newBooking: "Nueva reserva",
      back: "Volver",
      loading: "Cargando...",
      error: "Error",
      outOfServiceArea: "Fuera del área de servicio",
      estimatedPrice: "Precio estimado",
      bookingDetails: "Detalles de su reserva",
      reservationNumber: "Número de reserva",
      nextSteps: "Próximos pasos"
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=${language}&region=FR`
      script.async = true
      script.defer = true
      script.onload = initializeMaps
      document.head.appendChild(script)
    }

    const initializeMaps = () => {
      if (window.google && window.google.maps && mapRef.current) {
        const google = window.google
        setMaps(google.maps)

        // Initialiser la carte centrée sur Bordeaux
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 44.8378, lng: -0.5792 }, // Centre de Bordeaux
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        })

        setMap(mapInstance)

        // Services de directions
        const directionsServiceInstance = new google.maps.DirectionsService()
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#1e40af',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        })

        setDirectionsService(directionsServiceInstance)
        setDirectionsRenderer(directionsRendererInstance)

        // Autocomplete pour les champs d'adresse
        if (fromInputRef.current) {
          const autocompleteFromInstance = new google.maps.places.Autocomplete(
            fromInputRef.current,
            { 
              componentRestrictions: { country: 'fr' },
              bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(44.7, -0.7),
                new google.maps.LatLng(44.9, -0.4)
              ),
              types: ['address']
            }
          )
          setAutocompleteFrom(autocompleteFromInstance)

          autocompleteFromInstance.addListener('place_changed', () => {
            const place = autocompleteFromInstance.getPlace()
            if (place.geometry) {
              setTripData(prev => ({
                ...prev,
                from: place.formatted_address,
                fromCoords: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              }))
            }
          })
        }

        if (toInputRef.current) {
          const autocompleteToInstance = new google.maps.places.Autocomplete(
            toInputRef.current,
            { 
              componentRestrictions: { country: 'fr' },
              bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(44.7, -0.7),
                new google.maps.LatLng(44.9, -0.4)
              ),
              types: ['address']
            }
          )
          setAutocompleteTo(autocompleteToInstance)

          autocompleteToInstance.addListener('place_changed', () => {
            const place = autocompleteToInstance.getPlace()
            if (place.geometry) {
              setTripData(prev => ({
                ...prev,
                to: place.formatted_address,
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
  }, [language])

  // Fonction pour calculer l'itinéraire via Google Maps
  const calculateRoute = useCallback(() => {
    if (!directionsService || !directionsRenderer || !tripData.fromCoords || !tripData.toCoords) return

    setLoading(true)
    setError('')

    directionsService.route({
      origin: tripData.fromCoords,
      destination: tripData.toCoords,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false,
      unitSystem: window.google.maps.UnitSystem.METRIC
    }, (result: any, status: string) => {
      setLoading(false)
      
      if (status === 'OK' && result.routes[0]) {
        directionsRenderer.setDirections(result)
        
        const route = result.routes[0].legs[0]
        const distance = (route.distance?.value || 0) / 1000 // en km
        const duration = (route.duration?.value || 0) / 60 // en minutes
        
        // Calcul de prix avec frais d'approche
        const basePrice = 2.80 + (distance * 2.12)
        const approachFees = 10 // Frais d'approche et de réservation
        const finalPrice = Math.round((basePrice + approachFees) * 100) / 100
        
        setTripData(prev => ({
          ...prev,
          distance: distance,
          duration: duration,
          price: finalPrice,
          priceDetails: {
            basePrice: Math.round(basePrice * 100) / 100,
            approachFees: approachFees,
            totalPrice: finalPrice
          },
          routeInfo: {
            steps: route.steps,
            overview: result.routes[0].overview_polyline,
            bounds: result.routes[0].bounds
          },
          serviceAreaValidation: { valid: true }
        }))

        if (map && result.routes[0].bounds) {
          map.fitBounds(result.routes[0].bounds)
        }
        setMapVisible(true)
      } else {
        setError('Impossible de calculer l&apos;itinéraire')
      }
    })
  }, [directionsService, directionsRenderer, tripData.fromCoords, tripData.toCoords, map])

  // Calcul automatique de l'itinéraire
  useEffect(() => {
    if (tripData.fromCoords && tripData.toCoords && directionsService && directionsRenderer) {
      calculateRoute()
    }
  }, [tripData.fromCoords, tripData.toCoords, bookingData.passengers, bookingData.luggage, directionsService, directionsRenderer, calculateRoute])

  const handleBookingChange = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  // Soumission de la réservation (simulation locale)
  const submitReservation = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Simulation d'une réservation réussie
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simule un délai réseau
      
      const reservationId = 'TBS-' + Date.now().toString().slice(-6)
      const pickupTime = bookingData.isImmediate 
        ? new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        : new Date(bookingData.departureDate + 'T' + bookingData.departureTime)
      
      const reservationData: ReservationData = {
        reservationId: reservationId,
        customer: {
          name: bookingData.customerName,
          phone: bookingData.customerPhone,
          email: bookingData.customerEmail
        },
        trip: {
          from: { address: tripData.from },
          to: { address: tripData.to },
          distance: tripData.distance,
        },
        pricing: {
          totalPrice: tripData.price
        },
        bookingDetails: {
          passengers: bookingData.passengers,
          luggage: bookingData.luggage,
          notes: bookingData.notes
        },
        estimatedPickupTime: pickupTime.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        next_steps: [
          "Votre réservation a été confirmée",
          "Un chauffeur sera assigné 5 minutes avant l'heure de prise en charge",
          "Vous recevrez un SMS avec les détails du véhicule",
          "Pour toute modification, appelez le 06 67 23 78 22"
        ]
      }

      setReservation(reservationData)
      setSuccess(`Réservation confirmée ! Numéro : ${reservationId}`)
      setStep(4)

    } catch (error) {
      console.error('Erreur soumission réservation:', error)
      setError('Erreur lors de la création de la réservation. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Sélecteur de langue
  const LanguageSelector = () => (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => {
          setLanguage(e.target.value)
          setBookingData(prev => ({ ...prev, language: e.target.value }))
        }}
        className="bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇬🇧 English</option>
        <option value="es">🇪🇸 Español</option>
      </select>
    </div>
  )

  // Interface étape 1 avec carte
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step1Title')}</h2>
        <p className="text-gray-600">{t('step1Subtitle')}</p>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Validation zone de service */}
      {tripData.serviceAreaValidation && !tripData.serviceAreaValidation.valid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-yellow-600 shrink-0" size={20} />
          <div className="text-yellow-800">
            <p className="font-semibold">{t('outOfServiceArea')}</p>
            <p className="text-sm">{tripData.serviceAreaValidation.reason}</p>
          </div>
        </div>
      )}

      {/* Formulaire d'adresses */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Formulaire */}
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Bouton pour afficher/masquer la carte */}
          {(tripData.fromCoords || tripData.toCoords) && (
            <button
              onClick={() => setMapVisible(!mapVisible)}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Map className="w-4 h-4 mr-2" />
              {mapVisible ? t('hideMap') : t('showMap')}
            </button>
          )}

          {/* Informations de trajet */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <Loader2 className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                {t('calculatingRoute')}
              </div>
            </div>
          )}

          {tripData.distance > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                {t('routeCalculated')}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('distance')}:</span>
                  <div className="font-semibold text-lg">{(tripData.distance || 0).toFixed(1)} km</div>
                </div>
                <div>
                  <span className="text-gray-600">{t('duration')}:</span>
                  <div className="font-semibold text-lg">{Math.round(tripData.duration || 0)} {t('minutes')}</div>
                </div>
              </div>
              
              {tripData.price > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="text-center">
                    <span className="text-gray-600 text-sm">{t('estimatedPrice')} :</span>
                    <div className="text-2xl font-bold text-blue-700">
                      {(tripData.price || 0).toFixed(2)}€
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne droite - Carte */}
        <div className={`${mapVisible ? 'block' : 'hidden lg:block'} lg:sticky lg:top-4`}>
          <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <div className="h-96 lg:h-[500px] w-full">
              <div 
                ref={mapRef} 
                className="w-full h-full"
                style={{ minHeight: '300px' }}
              />
            </div>
            {tripData.distance > 0 && (
              <div className="p-3 bg-white border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-green-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tripData.from?.split(',')[0]}
                  </span>
                  <ArrowRight className="text-gray-400" size={16} />
                  <span className="flex items-center text-red-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tripData.to?.split(',')[0]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!tripData.fromCoords || !tripData.toCoords || loading || (tripData.serviceAreaValidation && !tripData.serviceAreaValidation.valid)}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        <Navigation className="w-5 h-5 mr-2" />
        {t('continue')}
      </button>
    </div>
  )

  // Interface étape 2 - Détails de réservation
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1,2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num}>{num} {language === 'en' ? 'passenger' : language === 'es' ? 'pasajero' : 'passager'}{num > 1 ? 's' : ''}</option>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[0,1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num} {language === 'en' ? 'bag' : language === 'es' ? 'maleta' : 'bagage'}{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Date et heure si pas immédiat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Quand ?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="when"
                  checked={bookingData.isImmediate}
                  onChange={() => handleBookingChange('isImmediate', true)}
                  className="mr-2"
                />
                Maintenant
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="when"
                  checked={!bookingData.isImmediate}
                  onChange={() => handleBookingChange('isImmediate', false)}
                  className="mr-2"
                />
                Plus tard
              </label>
            </div>
            
            {!bookingData.isImmediate && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={bookingData.departureDate}
                  onChange={(e) => handleBookingChange('departureDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="time"
                  value={bookingData.departureTime}
                  onChange={(e) => handleBookingChange('departureTime', e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-4 flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            {t('priceEstimate')}
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">
              {(tripData.price || 0).toFixed(2)}€
            </div>
            <div className="text-sm text-green-600 mt-2">
              {(tripData.distance || 0).toFixed(1)} km • {Math.round(tripData.duration || 0)} min
            </div>
            {tripData.priceDetails && (
              <div className="text-xs text-green-600 mt-2 space-y-1">
                <div>Prix course: {(tripData.priceDetails.basePrice || tripData.priceDetails.baseFare || 0).toFixed(2)}€</div>
                <div>Frais d&apos;approche et réservation: 10,00€</div>
                {(tripData.priceDetails.supplements || 0) > 0 && (
                  <div>Suppléments: {tripData.priceDetails.supplements?.toFixed(2)}€</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {t('continue')}
        </button>
      </div>
    </div>
  )

  // Interface étape 3 - Coordonnées client
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('step3Title')}</h2>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              {t('fullName')} *
            </label>
            <input
              type="text"
              placeholder={t('fullName')}
              value={bookingData.customerName}
              onChange={(e) => handleBookingChange('customerName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              {t('phone')} *
            </label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={bookingData.customerPhone}
              onChange={(e) => handleBookingChange('customerPhone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              {t('email')}
            </label>
            <input
              type="email"
              placeholder="votre@email.fr"
              value={bookingData.customerEmail}
              onChange={(e) => handleBookingChange('customerEmail', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              placeholder="Siège bébé, accessibilité, etc."
              value={bookingData.notes}
              onChange={(e) => handleBookingChange('notes', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Résumé de commande */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{t('bookingDetails')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Trajet:</span>
              <span className="font-medium text-right">
                {tripData.from?.split(',')[0]} → {tripData.to?.split(',')[0]}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Distance:</span>
              <span className="font-medium">{(tripData.distance || 0).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Durée:</span>
              <span className="font-medium">{Math.round(tripData.duration || 0)} min</span>
            </div>
            <div className="flex justify-between">
              <span>Passagers:</span>
              <span className="font-medium">{bookingData.passengers}</span>
            </div>
            <div className="flex justify-between">
              <span>Bagages:</span>
              <span className="font-medium">{bookingData.luggage}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('totalPrice')}:</span>
              <span className="text-green-600">{(tripData.price || 0).toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={submitReservation}
          disabled={!bookingData.customerName || !bookingData.customerPhone || loading}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              {t('loading')}...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              {t('confirmBooking')}
            </>
          )}
        </button>
      </div>
    </div>
  )

  // Interface étape 4 - Confirmation
  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{t('bookingConfirmed')}</h2>
      
      {reservation && (
        <div className="bg-white border border-green-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="font-semibold mb-4">{t('bookingDetails')}</h3>
          <div className="space-y-2 text-sm text-left">
            <div><strong>{t('reservationNumber')} :</strong> {reservation.reservationId}</div>
            <div><strong>Client :</strong> {reservation.customer.name}</div>
            <div><strong>Téléphone :</strong> {reservation.customer.phone}</div>
            <div><strong>Trajet :</strong> {reservation.trip.from.address.split(',')[0]} → {reservation.trip.to.address.split(',')[0]}</div>
            <div><strong>Prix :</strong> {reservation.pricing.totalPrice.toFixed(2)}€</div>
            <div><strong>Distance :</strong> {reservation.trip.distance.toFixed(1)} km</div>
            <div><strong>Prise en charge :</strong> {reservation.estimatedPickupTime}</div>
          </div>
        </div>
      )}

      {/* Prochaines étapes */}
      {reservation && reservation.next_steps && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h4 className="font-semibold text-blue-800 mb-3">{t('nextSteps')}</h4>
          <ul className="text-sm text-blue-700 space-y-2 text-left">
            {reservation.next_steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {t('newBooking')}
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && <div className={`w-8 h-0.5 transition-colors ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* Note d'information */}
      {step < 4 && (
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Prix calculés selon les tarifs officiels 2025 • Service 24h/24 7j/7</p>
          <p>Paiement en espèces ou carte bancaire • Véhicules climatisés</p>
        </div>
      )}
    </div>
  )
}

export default TaxiBookingWithBackend