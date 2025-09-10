'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Clock, Users, Briefcase, Euro, Calendar, Phone, Mail, Car, Navigation, CheckCircle, AlertCircle, Globe, Map, Route, Loader2, ArrowRight } from 'lucide-react'
import type { TripData, BookingData, ReservationData } from '../../types/booking'

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
const GOOGLE_MAPS_API_KEY = 'AIzaSyCarUqBqL2yuEy36eOw4JNatmclfOhOGs0'

const TaxiBookingHomePreview = () => {
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
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [step3ValidationAttempted, setStep3ValidationAttempted] = useState(false)

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

  // Données de réservation sans valeurs pré-remplies
  const [bookingData, setBookingData] = useState<BookingData>({
    passengers: 1, // Valeur minimale requise
    luggage: 0,   // Valeur par défaut acceptable
    departureDate: '', // Pas de date pré-remplie
    departureTime: '', // Pas d'heure pré-remplie
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
  const moduleRef = useRef<HTMLDivElement>(null)

  // Dictionnaire de traductions complet
  const translations = {
    fr: {
      title: "Réservation Taxi Bordeaux",
      subtitle: "Service 24h/24 • Prise en charge 5-10 minutes",
      step1Title: "Où souhaitez-vous aller ?",
      step1Subtitle: "Entrez votre point de départ et votre destination",
      fromPlaceholder: "Adresse départ (ex: Aéroport Bordeaux, Gare Saint-Jean)",
      toPlaceholder: "Adresse destination (ex: Place Comédie, Hôtel Intercontinental)",
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
      departureDate: "Date de départ",
      departureTime: "Heure de départ",
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
    }
  }

  const t = (key: string) => translations[language as keyof typeof translations]?.[key as keyof typeof translations.fr] || key

  // Initialisation Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if ((window as any).google && (window as any).google.maps) {
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
      if ((window as any).google && (window as any).google.maps && mapRef.current) {
        const google = (window as any).google
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
          draggable: false, // Pas de modification manuelle pour garder l'optimisation
          polylineOptions: {
            strokeColor: '#10b981', // Vert pour indiquer route optimisée
            strokeWeight: 5,        // Plus épais pour visibilité
            strokeOpacity: 0.9      // Plus opaque pour contraste
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
              types: ['establishment', 'geocode'], // Privilégier aéroports, gares, puis adresses
              strictBounds: false // Permettre des résultats hors bornes pour aéroports
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
              types: ['establishment', 'geocode'], // Privilégier aéroports, gares, puis adresses
              strictBounds: false // Permettre des résultats hors bornes pour aéroports
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

  // Fonction pour vérifier si c'est un jour férié
  const isPublicHoliday = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // Jours fériés fixes
    const fixedHolidays = [
      '01-01', // Nouvel An
      '05-01', // Fête du travail
      '05-08', // Victoire 1945
      '07-14', // Fête nationale
      '08-15', // Assomption
      '11-01', // Toussaint
      '11-11', // Armistice
      '12-25'  // Noël
    ]
    
    const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return fixedHolidays.includes(dateStr)
  }

  // Fonction pour calculer l'itinéraire via Google Maps avec tarification
  const calculateRoute = useCallback(() => {
    if (!directionsService || !directionsRenderer || !tripData.fromCoords || !tripData.toCoords) return

    setLoading(true)
    setError('')

    directionsService.route({
      origin: tripData.fromCoords,
      destination: tripData.toCoords,
      travelMode: (window as any).google.maps.TravelMode.DRIVING,
      avoidHighways: false, // Autorise autoroutes pour plus de rapidité
      avoidTolls: false,    // Autorise péages pour plus de rapidité
      unitSystem: (window as any).google.maps.UnitSystem.METRIC,
      optimizeWaypoints: true, // Optimise l'itinéraire
      provideRouteAlternatives: false, // Une seule route (la plus rapide)
      region: 'FR' // Région France pour optimisation locale
    }, (result: any, status: string) => {
      setLoading(false)
      
      if (status === 'OK' && result.routes[0]) {
        directionsRenderer.setDirections(result)
        
        const route = result.routes[0].legs[0]
        const distance = (route.distance?.value || 0) / 1000 // en km
        const duration = (route.duration?.value || 0) / 60 // en minutes
        
        // Calcul de prix - utilise date/heure si disponible, sinon tarif jour par défaut
        let departureDate: Date
        let isNight = false
        let isHoliday = false
        let isSunday = false
        
        if (bookingData.departureDate && bookingData.departureTime) {
          departureDate = new Date(bookingData.departureDate + 'T' + bookingData.departureTime)
          const hour = departureDate.getHours()
          isNight = hour >= 21 || hour < 7 // 21h-7h = tarif nuit
          isHoliday = isPublicHoliday(departureDate)
          isSunday = departureDate.getDay() === 0
        }
        
        // Tarifs de base (jour)
        let priseEnCharge = 2.80
        let tarifKm = 2.12
        
        // Majorations
        if (isNight || isHoliday || isSunday) {
          priseEnCharge = 3.50 // +25% environ
          tarifKm = 2.60 // +23% environ
        }
        
        const basePrice = priseEnCharge + (distance * tarifKm)
        const approachFees = 10 // Frais d'approche et de réservation
        const finalPrice = Math.round((basePrice + approachFees) * 100) / 100
        
        // Déterminer le type de tarif
        let tariffType = 'Jour'
        if (isHoliday) tariffType = 'Férié'
        else if (isSunday) tariffType = 'Dimanche'
        else if (isNight) tariffType = 'Nuit'
        
        setTripData(prev => ({
          ...prev,
          distance: distance,
          duration: duration,
          price: finalPrice,
          priceDetails: {
            basePrice: Math.round(basePrice * 100) / 100,
            approachFees: approachFees,
            totalPrice: finalPrice,
            tariffType: tariffType,
            priseEnCharge: priseEnCharge,
            tarifKm: tarifKm,
            isNight: isNight,
            isHoliday: isHoliday,
            isSunday: isSunday
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
  }, [directionsService, directionsRenderer, tripData.fromCoords, tripData.toCoords, bookingData.departureDate, bookingData.departureTime, map])

  // Calcul automatique de l'itinéraire dès que les adresses sont disponibles
  useEffect(() => {
    if (tripData.fromCoords && tripData.toCoords && directionsService && directionsRenderer) {
      calculateRoute()
    }
  }, [tripData.fromCoords, tripData.toCoords, bookingData.departureDate, bookingData.departureTime, directionsService, directionsRenderer, calculateRoute])


  const handleBookingChange = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  // Fonction pour ajuster le scroll de manière intelligente
  const scrollToModule = () => {
    if (moduleRef.current) {
      const element = moduleRef.current
      const rect = element.getBoundingClientRect()
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
      
      // Si le module n'est pas entièrement visible, le centrer
      if (!isVisible) {
        const offsetTop = element.offsetTop - (window.innerHeight - element.offsetHeight) / 2
        window.scrollTo({
          top: Math.max(0, offsetTop),
          behavior: 'smooth'
        })
      }
    }
  }

  // Soumission de la réservation avec envoi d'email
  const submitReservation = async () => {
    setLoading(true)
    setError('')
    
    try {
      const reservationId = 'TBS-' + Date.now().toString().slice(-6)
      const pickupTime = new Date(bookingData.departureDate + 'T' + bookingData.departureTime)
      
      const reservationData = {
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
          totalPrice: tripData.price,
          priceDetails: tripData.priceDetails
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

      // Envoi de l'email de confirmation
      let emailSent = false
      if (bookingData.customerEmail) {
        try {
          const emailResponse = await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData)
          })

          emailSent = emailResponse.ok
          if (!emailSent) {
            console.warn('Email de confirmation non envoyé')
          }
        } catch (emailError) {
          console.warn('Erreur envoi email:', emailError)
        }
      }

      setReservation({...reservationData, emailSent})
      const successMessage = bookingData.customerEmail && emailSent 
        ? `Réservation confirmée ! Numéro : ${reservationId}. Email de confirmation envoyé.`
        : `Réservation confirmée ! Numéro : ${reservationId}`
      setSuccess(successMessage)
      setStep(4)

    } catch (error) {
      console.error('Erreur soumission réservation:', error)
      setError('Erreur lors de la création de la réservation. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Interface étape 1 avec toutes les infos nécessaires pour le calcul de prix
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('step1Title')}</h3>
        <p className="text-gray-700 sm:text-gray-600">{t('step1Subtitle')}</p>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Formulaire complet */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne gauche - Formulaire */}
        <div className="space-y-4">
          {/* Adresses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-green-500" />
              {t('fromLabel')}
              {validationAttempted && !tripData.fromCoords && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              ref={fromInputRef}
              type="text"
              placeholder={t('fromPlaceholder')}
              value={tripData.from}
              onChange={(e) => setTripData(prev => ({ ...prev, from: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-red-500" />
              {t('toLabel')}
              {validationAttempted && !tripData.toCoords && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              ref={toInputRef}
              type="text"
              placeholder={t('toPlaceholder')}
              value={tripData.to}
              onChange={(e) => setTripData(prev => ({ ...prev, to: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
              required
            />
          </div>

          {/* Options de réservation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                {t('passengers')}
                {validationAttempted && !bookingData.passengers && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                value={bookingData.passengers}
                onChange={(e) => handleBookingChange('passengers', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                {validationAttempted && (bookingData.luggage === undefined || bookingData.luggage === null) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                value={bookingData.luggage}
                onChange={(e) => handleBookingChange('luggage', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[0,1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num} bagage{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date et heure - OBLIGATOIRES */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                {t('departureDate')}
                {validationAttempted && !bookingData.departureDate && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="date"
                value={bookingData.departureDate}
                onChange={(e) => handleBookingChange('departureDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                {t('departureTime')}
                {validationAttempted && !bookingData.departureTime && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="time"
                value={bookingData.departureTime}
                onChange={(e) => handleBookingChange('departureTime', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
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

          {tripData.distance > 0 && tripData.price > 0 && bookingData.departureDate && bookingData.departureTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                Estimation trajet
              </h3>
              <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                <div className="text-center">
                  <span className="text-gray-700 sm:text-gray-600 block">{t('distance')}</span>
                  <div className="font-semibold text-lg">{(tripData.distance || 0).toFixed(1)} km</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-700 sm:text-gray-600 block">{t('duration')}</span>
                  <div className="font-semibold text-lg">{Math.round(tripData.duration || 0)} min</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-700 sm:text-gray-600 block">Passagers</span>
                  <div className="font-semibold text-lg">{bookingData.passengers}</div>
                </div>
              </div>
              
              <div className="text-center pt-4 border-t border-green-200">
                <span className="text-gray-700 sm:text-gray-600 text-sm">{t('estimatedPrice')} :</span>
                <div className="text-3xl font-bold text-green-700">
                  {(tripData.price || 0).toFixed(2)}€
                </div>
                <div className="text-xs text-green-700 sm:text-green-600 mt-2 space-y-1">
                  {bookingData.departureDate && bookingData.departureTime ? (
                    <>
                      <div>Le {new Date(bookingData.departureDate).toLocaleDateString('fr-FR')} à {bookingData.departureTime}</div>
                      {tripData.priceDetails && (
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tripData.priceDetails.tariffType === 'Nuit' ? 'bg-blue-200 sm:bg-blue-100 text-blue-900 sm:text-blue-800' :
                            tripData.priceDetails.tariffType === 'Férié' ? 'bg-red-200 sm:bg-red-100 text-red-900 sm:text-red-800' :
                            tripData.priceDetails.tariffType === 'Dimanche' ? 'bg-purple-200 sm:bg-purple-100 text-purple-900 sm:text-purple-800' :
                            'bg-green-200 sm:bg-green-100 text-green-900 sm:text-green-800'
                          }`}>
                            Tarif {tripData.priceDetails.tariffType}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-orange-600 font-medium">💡 Prix affiné avec date et heure</div>
                  )}
                </div>
              </div>
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
                  <span className="flex items-center text-green-700 sm:text-green-600">
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
        onClick={() => {
          // Marquer qu'une tentative de validation a eu lieu
          setValidationAttempted(true)
          
          // Vérifier si tous les champs requis sont remplis
          const allFieldsValid = tripData.fromCoords && tripData.toCoords && 
                                bookingData.departureDate && bookingData.departureTime && 
                                bookingData.passengers && tripData.price
          
          if (allFieldsValid) {
            setStep(2)
            // Petit délai pour laisser le DOM se mettre à jour
            setTimeout(scrollToModule, 150)
          }
        }}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        <Navigation className="w-5 h-5 mr-2" />
        {!tripData.fromCoords || !tripData.toCoords ? 'Sélectionnez les adresses' :
         !bookingData.departureDate || !bookingData.departureTime ? 'Date et heure requises' :
         !tripData.price ? 'Calcul en cours...' :
         t('continue')}
      </button>
    </div>
  )

  // Interface étape 2 - Résumé de la réservation
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Résumé de votre réservation</h3>
        <p className="text-gray-700 sm:text-gray-600">Vérifiez les détails avant de finaliser</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Résumé complet */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {/* Trajet */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Trajet</div>
                  <div className="text-sm text-gray-700 sm:text-gray-600">
                    {tripData.from?.split(',')[0]} → {tripData.to?.split(',')[0]}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{(tripData.distance || 0).toFixed(1)} km</div>
                <div className="text-sm text-gray-600 sm:text-gray-500">{Math.round(tripData.duration || 0)} min</div>
              </div>
            </div>

            {/* Date et heure */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Prise en charge</div>
                  <div className="text-sm text-gray-700 sm:text-gray-600">
                    Le {new Date(bookingData.departureDate).toLocaleDateString('fr-FR')} à {bookingData.departureTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Passagers et bagages */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Détails</div>
                  <div className="text-sm text-gray-700 sm:text-gray-600">
                    {bookingData.passengers} passager{bookingData.passengers > 1 ? 's' : ''} • {bookingData.luggage} bagage{bookingData.luggage > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <div className="text-center">
                <div className="text-sm text-green-700 sm:text-green-600 mb-1">Prix total</div>
                <div className="text-3xl font-bold text-green-700">
                  {(tripData.price || 0).toFixed(2)}€
                </div>
                {tripData.priceDetails && (
                  <div className="text-xs text-green-700 sm:text-green-600 mt-2 space-y-1">
                    <div>Prix course ({tripData.priceDetails.tariffType}): {(tripData.priceDetails.basePrice || 0).toFixed(2)}€</div>
                    <div>Frais d&apos;approche et réservation: {tripData.priceDetails.approachFees || 10}€</div>
                    {(tripData.priceDetails.isNight || tripData.priceDetails.isHoliday || tripData.priceDetails.isSunday) && (
                      <div className="text-blue-700 sm:text-blue-600 font-medium">✓ Tarif majoré appliqué</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 max-w-2xl mx-auto">
        <button
          onClick={() => {
            setStep(1)
            setTimeout(scrollToModule, 150)
          }}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={() => {
            setStep(3)
            setTimeout(scrollToModule, 150)
          }}
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
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('step3Title')}</h3>
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
              {t('fullName')}
              {step3ValidationAttempted && !bookingData.customerName && <span className="text-red-500 ml-1">*</span>}
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
              {t('phone')}
              {step3ValidationAttempted && !bookingData.customerPhone && <span className="text-red-500 ml-1">*</span>}
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
              <span>Date:</span>
              <span className="font-medium">{new Date(bookingData.departureDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Heure:</span>
              <span className="font-medium">{bookingData.departureTime}</span>
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
              <span className="text-green-700 sm:text-green-600 font-semibold">{(tripData.price || 0).toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setStep(2)
            setTimeout(scrollToModule, 150)
          }}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={() => {
            // Marquer qu'une tentative de validation a eu lieu
            setStep3ValidationAttempted(true)
            
            // Vérifier si tous les champs requis sont remplis
            const allFieldsValid = bookingData.customerName && bookingData.customerPhone
            
            if (allFieldsValid && !loading) {
              submitReservation()
            }
          }}
          disabled={loading}
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
      <h3 className="text-2xl font-bold text-gray-800">{t('bookingConfirmed')}</h3>
      
      {reservation && (
        <div className="bg-white border border-green-200 rounded-lg p-6 max-w-md mx-auto">
          <h4 className="font-semibold mb-4">{t('bookingDetails')}</h4>
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

      {/* Information email */}
      {reservation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">Email de confirmation</p>
              <p className="text-blue-700 sm:text-blue-600 text-sm">
                {reservation.customer.email ? (
                  reservation.emailSent ? (
                    `✅ Envoyé à ${reservation.customer.email}`
                  ) : (
                    `⚠️ Échec d'envoi à ${reservation.customer.email}`
                  )
                ) : (
                  "❌ Aucun email fourni"
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setStep(1)
          setTripData({
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
          setBookingData({
            passengers: 1,
            luggage: 0,
            departureDate: '', // Reset sans pré-remplir
            departureTime: '', // Reset sans pré-remplir
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            notes: '',
            language: 'fr'
          })
          setReservation(null)
          setSuccess('')
          setError('')
          setValidationAttempted(false)
          setStep3ValidationAttempted(false)
        }}
        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {t('newBooking')}
      </button>
    </div>
  )

  return (
    <div ref={moduleRef} className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-6 border-2 sm:border border-blue-200 sm:border-blue-100 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">{t('title')}</h2>
            <p className="text-gray-700 sm:text-gray-600">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-300 sm:bg-gray-200 text-gray-700 sm:text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && <div className={`w-8 h-0.5 transition-colors ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border sm:border-0 border-gray-200">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      {/* Note d'information */}
      {step < 4 && (
        <div className="mt-6 text-center text-xs text-gray-600 sm:text-gray-500">
          <p>✓ Prix calculés selon les tarifs officiels 2025 • Service 24h/24 7j/7</p>
          <p>✓ Paiement en espèces ou carte bancaire • Véhicules climatisés</p>
          <p className="text-blue-600 font-medium mt-2">Les champs marqués d&apos;un * sont obligatoires</p>
        </div>
      )}
    </div>
  )
}

export default TaxiBookingHomePreview