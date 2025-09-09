'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Clock, Users, Briefcase, Euro, Calendar, Phone, Mail, Car, Navigation, CheckCircle, AlertCircle, Globe, Map, Route, Loader2, ArrowRight } from 'lucide-react'

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
const GOOGLE_MAPS_API_KEY = 'AIzaSyCarUqBqL2yuEy36eOw4JNatmclfOhOGs0'

const TaxiBookingHomePreview = () => {
  // États principaux
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('fr')
  const [maps, setMaps] = useState(null)
  const [map, setMap] = useState(null)
  const [directionsService, setDirectionsService] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)
  const [autocompleteFrom, setAutocompleteFrom] = useState(null)
  const [autocompleteTo, setAutocompleteTo] = useState(null)
  const [mapVisible, setMapVisible] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Données du trajet
  const [tripData, setTripData] = useState({
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

  // Données de réservation avec date/heure par défaut
  const [bookingData, setBookingData] = useState({
    passengers: 1,
    luggage: 0,
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: new Date(Date.now() + 30 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    language: 'fr'
  })

  // Réservation créée
  const [reservation, setReservation] = useState(null)

  // Références
  const fromInputRef = useRef(null)
  const toInputRef = useRef(null)
  const mapRef = useRef(null)

  // Dictionnaire de traductions complet
  const translations = {
    fr: {
      title: "Réservation Taxi Bordeaux",
      subtitle: "Service 24h/24 • Prise en charge 5-10 minutes",
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

  // Calcul automatique de l'itinéraire
  useEffect(() => {
    if (tripData.fromCoords && tripData.toCoords && directionsService && directionsRenderer) {
      calculateRoute()
    }
  }, [tripData.fromCoords, tripData.toCoords, bookingData.passengers, bookingData.luggage, bookingData.departureDate, bookingData.departureTime, directionsService, directionsRenderer])

  // Fonction pour vérifier si c'est un jour férié
  const isPublicHoliday = (date) => {
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
  const calculateRoute = () => {
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
    }, (result, status) => {
      setLoading(false)
      
      if (status === 'OK' && result.routes[0]) {
        directionsRenderer.setDirections(result)
        
        const route = result.routes[0].legs[0]
        const distance = (route.distance?.value || 0) / 1000 // en km
        const duration = (route.duration?.value || 0) / 60 // en minutes
        
        // Calcul de prix avec tarification jour/nuit/férié
        const departureDate = new Date(bookingData.departureDate + 'T' + bookingData.departureTime)
        const hour = departureDate.getHours()
        const isNight = hour >= 21 || hour < 7 // 21h-7h = tarif nuit
        const isHoliday = isPublicHoliday(departureDate)
        const isSunday = departureDate.getDay() === 0
        
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
        setError('Impossible de calculer l\'itinéraire')
      }
    })
  }

  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }))
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
        <p className="text-gray-600">{t('step1Subtitle')}</p>
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

          {/* Options de réservation */}
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[0,1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num} bagage{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                {t('departureDate')}
              </label>
              <input
                type="date"
                value={bookingData.departureDate}
                onChange={(e) => handleBookingChange('departureDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                {t('departureTime')}
              </label>
              <input
                type="time"
                value={bookingData.departureTime}
                onChange={(e) => handleBookingChange('departureTime', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

          {tripData.distance > 0 && tripData.price > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                Estimation complète
              </h3>
              <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                <div className="text-center">
                  <span className="text-gray-600 block">{t('distance')}</span>
                  <div className="font-semibold text-lg">{(tripData.distance || 0).toFixed(1)} km</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-600 block">{t('duration')}</span>
                  <div className="font-semibold text-lg">{Math.round(tripData.duration || 0)} min</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-600 block">Passagers</span>
                  <div className="font-semibold text-lg">{bookingData.passengers}</div>
                </div>
              </div>
              
              <div className="text-center pt-4 border-t border-green-200">
                <span className="text-gray-600 text-sm">{t('estimatedPrice')} :</span>
                <div className="text-3xl font-bold text-green-700">
                  {(tripData.price || 0).toFixed(2)}€
                </div>
                <div className="text-xs text-green-600 mt-2 space-y-1">
                  <div>Le {new Date(bookingData.departureDate).toLocaleDateString('fr-FR')} à {bookingData.departureTime}</div>
                  {tripData.priceDetails && (
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tripData.priceDetails.tariffType === 'Nuit' ? 'bg-blue-100 text-blue-800' :
                        tripData.priceDetails.tariffType === 'Férié' ? 'bg-red-100 text-red-800' :
                        tripData.priceDetails.tariffType === 'Dimanche' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        Tarif {tripData.priceDetails.tariffType}
                      </span>
                    </div>
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
        disabled={!tripData.fromCoords || !tripData.toCoords || loading || !tripData.price}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        <Navigation className="w-5 h-5 mr-2" />
        {t('continue')}
      </button>
    </div>
  )

  // Interface étape 2 - Résumé de la réservation
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Résumé de votre réservation</h3>
        <p className="text-gray-600">Vérifiez les détails avant de finaliser</p>
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
                  <div className="text-sm text-gray-600">
                    {tripData.from?.split(',')[0]} → {tripData.to?.split(',')[0]}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{(tripData.distance || 0).toFixed(1)} km</div>
                <div className="text-sm text-gray-500">{Math.round(tripData.duration || 0)} min</div>
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
                  <div className="text-sm text-gray-600">
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
                  <div className="text-sm text-gray-600">
                    {bookingData.passengers} passager{bookingData.passengers > 1 ? 's' : ''} • {bookingData.luggage} bagage{bookingData.luggage > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <div className="text-center">
                <div className="text-sm text-green-600 mb-1">Prix total</div>
                <div className="text-3xl font-bold text-green-700">
                  {(tripData.price || 0).toFixed(2)}€
                </div>
                {tripData.priceDetails && (
                  <div className="text-xs text-green-600 mt-2 space-y-1">
                    <div>Prix course ({tripData.priceDetails.tariffType}): {(tripData.priceDetails.basePrice || 0).toFixed(2)}€</div>
                    <div>Frais d'approche et réservation: {tripData.priceDetails.approachFees || 10}€</div>
                    {(tripData.priceDetails.isNight || tripData.priceDetails.isHoliday || tripData.priceDetails.isSunday) && (
                      <div className="text-blue-600 font-medium">✓ Tarif majoré appliqué</div>
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
              <p className="text-blue-600 text-sm">
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
            departureDate: new Date().toISOString().split('T')[0],
            departureTime: new Date(Date.now() + 30 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            notes: '',
            language: 'fr'
          })
          setReservation(null)
          setSuccess('')
          setError('')
        }}
        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {t('newBooking')}
      </button>
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 lg:p-8 border border-blue-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">{t('title')}</h2>
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

export default TaxiBookingHomePreview