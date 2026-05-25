'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Clock, Users, Briefcase, Euro, Calendar, Phone, Mail, Car, Navigation, CheckCircle, AlertCircle, Globe, Map, Route, Loader2, ArrowRight, Crosshair } from 'lucide-react'
import type { TripData, BookingData, ReservationData } from '../../types/booking'
import { calculateDistanceFare, isNightMinutes } from '@/app/lib/pricing'
import EmailCaptureForm from './EmailCaptureForm'

// Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
const GOOGLE_MAPS_API_KEY = 'AIzaSyCarUqBqL2yuEy36eOw4JNatmclfOhOGs0'

const TaxiBookingHomePreview = () => {
  // États principaux
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('fr')

  // Forfaits et config prix chargés depuis l'API
  const [forfaits, setForfaits] = useState<any[]>([])
  const [configPrix, setConfigPrix] = useState({
    priseEnCharge: 2.83,
    tarifKmJour: 2.16,
    tarifKmNuit: 3.24,
    fraisApproche: 7.20,
    courseMini: 28.00,
    courseMiniDe: 20.00,
    heureDebutNuit: '19:00',
    heureFinNuit: '07:00',
    remiseActive: false,
    remiseSeuilKm: 50,
    remisePourcentage: 10,
    suppApprocheActive: false,
    suppApprocheSeuilKm: 50,
    itineraireCourt: true,
    tarifNuitDegressifActive: false,
    tarifNuitDegressifSeuilKm: 30,
    tarifNuitDegressifPrixKm: 2.50,
    tarifNuitDegressifMode: 'degressif',
    tarifJourDegressifActive: false,
    tarifJourDegressifSeuilKm: 30,
    tarifJourDegressifPrixKm: 1.80,
    tarifJourDegressifMode: 'degressif',
    seuilKmCaptureLead: 25,
    captureLeadActive: true,
    joursOff: [] as string[],
  })
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
  const [leadFirstname, setLeadFirstname] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadCaptureValidationAttempted, setLeadCaptureValidationAttempted] = useState(false)

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
  const [tollCost, setTollCost] = useState(0)
  const [prixAvantRemise, setPrixAvantRemise] = useState(0)
  const [prixSansDegressif, setPrixSansDegressif] = useState(0)
  const [estimationId, setEstimationId] = useState<string | null>(null)

  const [bookingData, setBookingData] = useState<BookingData>(() => {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().slice(0, 5)
    return {
      passengers: 1,
      luggage: 0,
      departureDate: date,
      departureTime: time,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
      language: 'fr'
    }
  })

  // Réservation créée
  const [reservation, setReservation] = useState<ReservationData | null>(null)

  // Références
  const fromInputRef = useRef<HTMLInputElement>(null)
  const toInputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const moduleRef = useRef<HTMLDivElement>(null)
  const mapsLoadedRef = useRef(false)

  // Dictionnaire de traductions complet
  const translations = {
    fr: {
      title: "Réservation Taxi Bordeaux",
      subtitle: "Service 24h/24 • Prise en charge rapide",
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
      continue: "Réserver",
      step2Title: "Détails de votre réservation",
      passengers: "Passagers",
      luggage: "Bagages",
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
      nextSteps: "Prochaines étapes",
      routeEstimate: "Estimation trajet",
      passengerSingular: "passager",
      passengerPlural: "passagers",
      luggageSingular: "bagage",
      luggagePlural: "bagages",
      priceFineWithDateTime: "💡 Prix affiné avec date et heure",
      tariffLabel: "Tarif",
      tariffApplied: "appliqué",
      step2Summary: "Résumé de votre réservation",
      step2Subtitle: "Vérifiez les détails avant de finaliser",
      journey: "Trajet",
      pickup: "Prise en charge",
      details: "Détails",
      totalPriceLabel: "Prix total",
      tripLabel: "Trajet :",
      distanceLabel: "Distance :",
      durationLabel: "Durée :",
      dateLabel: "Date :",
      timeLabel: "Heure :",
      passengersLabel: "Passagers :",
      luggageLabel: "Bagages :",
      clientLabel: "Client :",
      phoneLabel: "Téléphone :",
      priceLabel: "Prix :",
      pickupLabel: "Prise en charge :",
      emailConfirmation: "Email de confirmation",
      emailSent: "Envoyé à",
      emailFailed: "Échec d'envoi à",
      emailNone: "Aucun email fourni",
      bookNow: "Estimez et réservez",
      bookNowHighlight: "votre trajet",
      officialPrices: "✓ Prix officiels 2026 • Service 24h/24",
      requiredFields: "Les champs marqués d'un * sont obligatoires",
      selectAddresses: "Sélectionnez les adresses",
      dateTimeRequired: "Date et heure requises",
      calculatingPrice: "Calcul en cours...",
      notesPlaceholder: "N° de vol, n° de train, siège bébé, accessibilité, etc.",
      pickupOn: "Le",
      pickupAt: "à",
      tariffNight: "Nuit",
      tariffDay: "Jour",
      tariffMixed: "Mixte",
      tariffHoliday: "Férié",
      tariffSunday: "Dimanche",
      bookNowBtn: "Réserver maintenant",
    },
    en: {
      title: "Taxi Bordeaux Solution",
      subtitle: "Online booking • 24/7 service",
      step1Title: "Where would you like to go?",
      step1Subtitle: "Enter your pickup and destination address",
      fromPlaceholder: "Pickup address (e.g., Bordeaux Airport, Saint-Jean Station)",
      toPlaceholder: "Destination address (e.g., Place de la Comédie, Hotel...)",
      fromLabel: "Pickup point",
      toLabel: "Destination",
      calculatingRoute: "Calculating route...",
      routeCalculated: "Route calculated",
      showMap: "Show map",
      hideMap: "Hide map",
      distance: "Distance",
      duration: "Estimated time",
      minutes: "minutes",
      continue: "Book now",
      step2Title: "Your booking details",
      passengers: "Passengers",
      luggage: "Luggage",
      departureDate: "Departure date",
      departureTime: "Departure time",
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
      nextSteps: "Next steps",
      routeEstimate: "Route estimate",
      passengerSingular: "passenger",
      passengerPlural: "passengers",
      luggageSingular: "bag",
      luggagePlural: "bags",
      priceFineWithDateTime: "💡 Price refined with date and time",
      tariffLabel: "Rate",
      tariffApplied: "applied",
      step2Summary: "Your booking summary",
      step2Subtitle: "Check details before finalizing",
      journey: "Journey",
      pickup: "Pickup",
      details: "Details",
      totalPriceLabel: "Total price",
      tripLabel: "Journey:",
      distanceLabel: "Distance:",
      durationLabel: "Duration:",
      dateLabel: "Date:",
      timeLabel: "Time:",
      passengersLabel: "Passengers:",
      luggageLabel: "Bags:",
      clientLabel: "Customer:",
      phoneLabel: "Phone:",
      priceLabel: "Price:",
      pickupLabel: "Pickup:",
      emailConfirmation: "Confirmation email",
      emailSent: "Sent to",
      emailFailed: "Failed to send to",
      emailNone: "No email provided",
      bookNow: "Estimate and book",
      bookNowHighlight: "your trip",
      officialPrices: "✓ Official 2026 rates • 24/7 service",
      requiredFields: "Fields marked with * are required",
      selectAddresses: "Select addresses",
      dateTimeRequired: "Date and time required",
      calculatingPrice: "Calculating...",
      notesPlaceholder: "Flight number, train number, baby seat, accessibility, etc.",
      pickupOn: "On",
      pickupAt: "at",
      tariffNight: "Night",
      tariffDay: "Day",
      tariffMixed: "Mixed",
      tariffHoliday: "Holiday",
      tariffSunday: "Sunday",
      bookNowBtn: "Book now",
    },
    es: {
      title: "Taxi Bordeaux Solution",
      subtitle: "Reserva online • Servicio 24h/24",
      step1Title: "¿A dónde quiere ir?",
      step1Subtitle: "Introduzca su punto de recogida y destino",
      fromPlaceholder: "Dirección de recogida (ej: Aeropuerto Burdeos, Estación Saint-Jean)",
      toPlaceholder: "Dirección de destino (ej: Place de la Comédie, Hotel...)",
      fromLabel: "Punto de recogida",
      toLabel: "Destino",
      calculatingRoute: "Calculando ruta...",
      routeCalculated: "Ruta calculada",
      showMap: "Mostrar mapa",
      hideMap: "Ocultar mapa",
      distance: "Distancia",
      duration: "Tiempo estimado",
      minutes: "minutos",
      continue: "Reservar",
      step2Title: "Detalles de su reserva",
      passengers: "Pasajeros",
      luggage: "Equipaje",
      departureDate: "Fecha de salida",
      departureTime: "Hora de salida",
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
      nextSteps: "Próximos pasos",
      routeEstimate: "Estimación del trayecto",
      passengerSingular: "pasajero",
      passengerPlural: "pasajeros",
      luggageSingular: "equipaje",
      luggagePlural: "equipajes",
      priceFineWithDateTime: "💡 Precio ajustado con fecha y hora",
      tariffLabel: "Tarifa",
      tariffApplied: "aplicada",
      step2Summary: "Resumen de su reserva",
      step2Subtitle: "Verifique los detalles antes de finalizar",
      journey: "Trayecto",
      pickup: "Recogida",
      details: "Detalles",
      totalPriceLabel: "Precio total",
      tripLabel: "Trayecto:",
      distanceLabel: "Distancia:",
      durationLabel: "Duración:",
      dateLabel: "Fecha:",
      timeLabel: "Hora:",
      passengersLabel: "Pasajeros:",
      luggageLabel: "Equipajes:",
      clientLabel: "Cliente:",
      phoneLabel: "Teléfono:",
      priceLabel: "Precio:",
      pickupLabel: "Recogida:",
      emailConfirmation: "Email de confirmación",
      emailSent: "Enviado a",
      emailFailed: "Error al enviar a",
      emailNone: "No se proporcionó email",
      bookNow: "Estime y reserve",
      bookNowHighlight: "su trayecto",
      officialPrices: "✓ Tarifas oficiales 2026 • Servicio 24h/24",
      requiredFields: "Los campos marcados con * son obligatorios",
      selectAddresses: "Seleccione las direcciones",
      dateTimeRequired: "Fecha y hora requeridas",
      calculatingPrice: "Calculando...",
      notesPlaceholder: "N° de vuelo, n° de tren, silla de bebé, accesibilidad, etc.",
      pickupOn: "El",
      pickupAt: "a las",
      tariffNight: "Noche",
      tariffDay: "Día",
      tariffMixed: "Mixta",
      tariffHoliday: "Festivo",
      tariffSunday: "Domingo",
      bookNowBtn: "Reservar ahora",
    }
  }

  const needsCapture = configPrix.captureLeadActive && tripData.distance >= configPrix.seuilKmCaptureLead && configPrix.seuilKmCaptureLead > 0
  const totalSteps = needsCapture ? 5 : 4

  const t = (key: string) => translations[language as keyof typeof translations]?.[key as keyof typeof translations.fr] || key

  const dateLocale = language === 'en' ? 'en-GB' : language === 'es' ? 'es-ES' : 'fr-FR'

  const getTariffLabel = (type: string) => {
    const map: Record<string, string> = {
      'Nuit': t('tariffNight'),
      'Jour': t('tariffDay'),
      'Mixte': t('tariffMixed'),
      'Férié': t('tariffHoliday'),
      'Dimanche': t('tariffSunday'),
    }
    return map[type] || type
  }

  const LanguageSelector = () => (
    <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-3 py-1.5 shadow-sm">
      <Globe className="w-4 h-4 text-blue-500 shrink-0" />
      <select
        value={language}
        onChange={(e) => {
          setLanguage(e.target.value)
          setBookingData(prev => ({ ...prev, language: e.target.value }))
        }}
        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
      >
        <option value="fr">FR</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </div>
  )

  // Initialisation carte + autocomplete (appelé après chargement du script)
  const initializeMaps = useCallback(() => {
    const google = (window as any).google
    if (!google?.maps || !mapRef.current) return
    setMaps(google.maps)

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 44.8378, lng: -0.5792 },
      zoom: 12,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    })
    setMap(mapInstance)

    const directionsServiceInstance = new google.maps.DirectionsService()
    const directionsRendererInstance = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: false,
      draggable: false,
      polylineOptions: { strokeColor: '#10b981', strokeWeight: 5, strokeOpacity: 0.9 }
    })
    setDirectionsService(directionsServiceInstance)
    setDirectionsRenderer(directionsRendererInstance)

    if (fromInputRef.current) {
      const autocompleteFromInstance = new google.maps.places.Autocomplete(
        fromInputRef.current,
        {
          componentRestrictions: { country: 'fr' },
          bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(44.7, -0.7),
            new google.maps.LatLng(44.9, -0.4)
          ),
          types: ['establishment', 'geocode'],
          strictBounds: false
        }
      )
      setAutocompleteFrom(autocompleteFromInstance)
      autocompleteFromInstance.addListener('place_changed', () => {
        const place = autocompleteFromInstance.getPlace()
        if (place.geometry) {
          setTripData(prev => ({
            ...prev,
            from: place.formatted_address || place.name || prev.from,
            fromCoords: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          }))
        } else {
          const query = place.name || fromInputRef.current?.value || ''
          if (query) {
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ address: query, region: 'FR' }, (results: any, status: string) => {
              if (status === 'OK' && results[0]) {
                const loc = results[0].geometry.location
                setTripData(prev => ({
                  ...prev,
                  from: results[0].formatted_address,
                  fromCoords: { lat: loc.lat(), lng: loc.lng() }
                }))
                if (fromInputRef.current) fromInputRef.current.value = results[0].formatted_address
              }
            })
          }
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
          types: ['establishment', 'geocode'],
          strictBounds: false
        }
      )
      setAutocompleteTo(autocompleteToInstance)
      autocompleteToInstance.addListener('place_changed', () => {
        const place = autocompleteToInstance.getPlace()
        if (place.geometry) {
          setTripData(prev => ({
            ...prev,
            to: place.formatted_address || place.name || prev.to,
            toCoords: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          }))
        } else {
          const query = place.name || toInputRef.current?.value || ''
          if (query) {
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ address: query, region: 'FR' }, (results: any, status: string) => {
              if (status === 'OK' && results[0]) {
                const loc = results[0].geometry.location
                setTripData(prev => ({
                  ...prev,
                  to: results[0].formatted_address,
                  toCoords: { lat: loc.lat(), lng: loc.lng() }
                }))
                if (toInputRef.current) toInputRef.current.value = results[0].formatted_address
              }
            })
          }
        }
      })
    }
  }, []) // Les setters React et les refs sont stables, aucune dépendance nécessaire

  // Chargement lazy : déclenché au premier focus sur un champ d'adresse
  const loadGoogleMapsLazy = useCallback(() => {
    if (mapsLoadedRef.current) return
    mapsLoadedRef.current = true

    if ((window as any).google?.maps) {
      initializeMaps()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,drawing&language=${language}&region=FR`
    script.async = true
    script.defer = true
    script.onload = initializeMaps
    document.head.appendChild(script)
  }, [language, initializeMaps])

  // Chargement des forfaits et config prix depuis l'API
  useEffect(() => {
    fetch('/api/public/forfaits')
      .then(r => r.json())
      .then(d => { if (d.success) setForfaits(d.data) })
      .catch(() => {})

    fetch('/api/public/prix')
      .then(r => r.json())
      .then(d => { if (d.success) setConfigPrix(prev => ({ ...prev, ...d.data })) })
      .catch(() => {})
  }, [])

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

  // Calcul de l'itinéraire - uniquement Google Maps, sans calcul de prix
  const calculateRoute = useCallback(() => {
    if (!directionsService || !directionsRenderer || !tripData.fromCoords || !tripData.toCoords) return

    setLoading(true)
    setError('')

    directionsService.route({
      origin: tripData.fromCoords,
      destination: tripData.toCoords,
      travelMode: (window as any).google.maps.TravelMode.DRIVING,
      avoidHighways: configPrix.itineraireCourt,
      avoidTolls: false,
      unitSystem: (window as any).google.maps.UnitSystem.METRIC,
      optimizeWaypoints: true,
      provideRouteAlternatives: false,
      region: 'FR'
    }, (result: any, status: string) => {
      setLoading(false)

      if (status === 'OK' && result.routes[0]) {
        directionsRenderer.setDirections(result)

        const route = result.routes[0].legs[0]
        const distance = (route.distance?.value || 0) / 1000
        const duration = (route.duration?.value || 0) / 60

        setTripData(prev => ({
          ...prev,
          distance,
          duration,
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

        // Estimation péages
        if (tripData.fromCoords && tripData.toCoords) {
          fetch('/api/toll-estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin: tripData.fromCoords, destination: tripData.toCoords }),
          })
            .then(r => r.json())
            .then(d => setTollCost(d.tollCost || 0))
            .catch(() => setTollCost(0))
        }
      } else {
        setError('Impossible de calculer l&apos;itinéraire')
      }
    })
  }, [directionsService, directionsRenderer, tripData.fromCoords, tripData.toCoords, map, configPrix.itineraireCourt])

  // Calcul automatique de l'itinéraire dès que les adresses sont disponibles
  useEffect(() => {
    if (tripData.fromCoords && tripData.toCoords && directionsService && directionsRenderer) {
      calculateRoute()
    }
  }, [tripData.fromCoords, tripData.toCoords, directionsService, directionsRenderer, calculateRoute])

  // Recalcul du prix à chaque changement de distance, durée, date ou heure — sans rappel Google Maps
  useEffect(() => {
    if (tripData.distance <= 0 || tripData.duration <= 0) return

    let departureDate: Date | null = null
    let isNight = false
    let isHoliday = false
    let isSunday = false

    if (bookingData.departureDate && bookingData.departureTime) {
      const d = new Date(bookingData.departureDate + 'T' + bookingData.departureTime)
      if (!isNaN(d.getTime())) {
        departureDate = d
        const hour = d.getHours()
        isNight = hour >= 19 || hour < 7
        isHoliday = isPublicHoliday(d)
        isSunday = d.getDay() === 0
      }
    }

    const priseEnCharge = configPrix.priseEnCharge
    const DAY_RATE  = configPrix.tarifKmJour
    const NIGHT_RATE = configPrix.tarifKmNuit

    let distanceFare: number
    let degressifApplique = false
    const useNuitReduit = configPrix.tarifNuitDegressifActive && tripData.distance > configPrix.tarifNuitDegressifSeuilKm
    const nuitReduitCalc = (dist: number, rate: number) => {
      if (configPrix.tarifNuitDegressifMode === 'retroactif') {
        return dist * configPrix.tarifNuitDegressifPrixKm
      }
      const seuil = configPrix.tarifNuitDegressifSeuilKm
      return seuil * rate + (dist - seuil) * configPrix.tarifNuitDegressifPrixKm
    }
    const useJourReduit = configPrix.tarifJourDegressifActive && tripData.distance > configPrix.tarifJourDegressifSeuilKm
    const jourReduitCalc = (dist: number, rate: number) => {
      if (configPrix.tarifJourDegressifMode === 'retroactif') {
        return dist * configPrix.tarifJourDegressifPrixKm
      }
      const seuil = configPrix.tarifJourDegressifSeuilKm
      return seuil * rate + (dist - seuil) * configPrix.tarifJourDegressifPrixKm
    }
    let tarifNormalSansDegressif = 0
    if (isHoliday || isSunday) {
      if (useNuitReduit) {
        distanceFare = nuitReduitCalc(tripData.distance, NIGHT_RATE)
        degressifApplique = true
        tarifNormalSansDegressif = tripData.distance * NIGHT_RATE
      } else {
        distanceFare = tripData.distance * NIGHT_RATE
      }
    } else if (departureDate) {
      if (useNuitReduit && isNight) {
        distanceFare = nuitReduitCalc(tripData.distance, NIGHT_RATE)
        degressifApplique = true
        tarifNormalSansDegressif = tripData.distance * NIGHT_RATE
      } else if (useJourReduit && !isNight) {
        distanceFare = jourReduitCalc(tripData.distance, DAY_RATE)
        degressifApplique = true
        tarifNormalSansDegressif = tripData.distance * DAY_RATE
      } else {
        distanceFare = calculateDistanceFare(departureDate, tripData.duration, tripData.distance, DAY_RATE, NIGHT_RATE)
      }
    } else {
      if (useJourReduit) {
        distanceFare = jourReduitCalc(tripData.distance, DAY_RATE)
        degressifApplique = true
        tarifNormalSansDegressif = tripData.distance * DAY_RATE
      } else {
        distanceFare = tripData.distance * DAY_RATE
      }
    }

    const basePrice = priseEnCharge + distanceFare
    const approachFees = (configPrix.suppApprocheActive && tripData.distance >= configPrix.suppApprocheSeuilKm) ? 0 : configPrix.fraisApproche
    let finalPrice = Math.max(Math.round((basePrice + approachFees + tollCost) * 100) / 100, configPrix.courseMini)

    let prixNormalSansDegressif = 0
    if (degressifApplique) {
      const basePriceNormal = priseEnCharge + tarifNormalSansDegressif
      prixNormalSansDegressif = Math.max(Math.round((basePriceNormal + approachFees + tollCost) * 100) / 100, configPrix.courseMini)
    }

    // ── Vérification forfaits (chargés depuis l'API) ─────────────────────
    const distM = (a: {lat: number, lng: number}, b: {lat: number, lng: number}) => {
      const R = 6371000
      const dLat = (b.lat - a.lat) * Math.PI / 180
      const dLng = (b.lng - a.lng) * Math.PI / 180
      const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
      return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
    }

    // Ray casting : point dans polygone
    const pointInPolygon = (pt: {lat: number, lng: number}, poly: {lat: number, lng: number}[]) => {
      let inside = false
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].lng, yi = poly[i].lat
        const xj = poly[j].lng, yj = poly[j].lat
        if (((yi > pt.lat) !== (yj > pt.lat)) && (pt.lng < ((xj - xi) * (pt.lat - yi)) / (yj - yi) + xi)) {
          inside = !inside
        }
      }
      return inside
    }

    const coordInZone = (coords: {lat: number, lng: number} | null, point: any) => {
      if (!coords) return false
      if (point.zone && point.zone.length > 2) return pointInPolygon(coords, point.zone)
      if (point.lat && point.lng) return distM(coords, { lat: point.lat, lng: point.lng }) <= 500
      return false
    }

    let isForfait = false
    for (const f of forfaits) {
      if (!f.actif) continue
      const matchAB = coordInZone(tripData.fromCoords, f.pointA) && coordInZone(tripData.toCoords, f.pointB)
      const matchBA = coordInZone(tripData.fromCoords, f.pointB) && coordInZone(tripData.toCoords, f.pointA)
      if (matchAB || matchBA) {
        finalPrice = (isNight || isHoliday || isSunday) ? f.prixNuit : f.prixJour
        isForfait = true
        break
      }
    }

    // Remise courses longues
    let remiseAppliquee = false
    let prixSansRemise = finalPrice
    if (configPrix.remiseActive && !isForfait && tripData.distance >= configPrix.remiseSeuilKm) {
      prixSansRemise = finalPrice
      finalPrice = Math.round(finalPrice * (1 - configPrix.remisePourcentage / 100) * 100) / 100
      remiseAppliquee = true
    }
    setPrixAvantRemise(remiseAppliquee ? prixSansRemise : 0)
    if (degressifApplique && !isForfait && prixNormalSansDegressif > finalPrice) {
      let prixBarreDegressif = prixNormalSansDegressif
      if (remiseAppliquee) {
        prixBarreDegressif = Math.round(prixNormalSansDegressif * (1 - configPrix.remisePourcentage / 100) * 100) / 100
      }
      setPrixSansDegressif(prixBarreDegressif)
    } else {
      setPrixSansDegressif(0)
    }

    let tariffType = 'Jour'
    if (isHoliday) tariffType = 'Férié'
    else if (isSunday) tariffType = 'Dimanche'
    else if (departureDate && tripData.duration > 0) {
      const depMin = departureDate.getHours() * 60 + departureDate.getMinutes()
      const arrMin = depMin + tripData.duration
      if (isNightMinutes(depMin) && isNightMinutes(arrMin)) tariffType = 'Nuit'
      else if (!isNightMinutes(depMin) && !isNightMinutes(arrMin)) tariffType = 'Jour'
      else tariffType = 'Mixte'
    } else if (isNight) tariffType = 'Nuit'

    setTripData(prev => ({
      ...prev,
      price: finalPrice,
      priceDetails: {
        basePrice: Math.round(basePrice * 100) / 100,
        approachFees,
        tollCost,
        totalPrice: finalPrice,
        tariffType,
        priseEnCharge,
        isNight,
        isHoliday,
        isSunday,
        isForfait
      }
    }))

    const fourchetteTrack = isForfait
      ? null
      : finalPrice <= configPrix.courseMini
        ? { de: configPrix.courseMiniDe || 0, a: configPrix.courseMini || 0 }
        : { de: (finalPrice || 0) - (configPrix.fraisApproche || 0), a: finalPrice || 0 }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'estimation_prix', {
        event_category: 'estimation',
        from: tripData.from,
        to: tripData.to,
        distance: tripData.distance,
        duration: tripData.duration,
        price: finalPrice,
        tariff_type: tariffType,
        is_forfait: isForfait,
      })
    }

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    fetch('/api/estimations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: tripData.from,
        to: tripData.to,
        distance: tripData.distance,
        duration: tripData.duration,
        price: finalPrice,
        fourchette: fourchetteTrack,
        tariffType,
        isForfait,
        departureDate: departureDate ? departureDate.toISOString() : null,
        utmSource: urlParams?.get('utm_source') || null,
        utmMedium: urlParams?.get('utm_medium') || null,
        utmCampaign: urlParams?.get('utm_campaign') || null,
      }),
    })
      .then(r => r.json())
      .then(d => { if (d.id) setEstimationId(d.id) })
      .catch(() => {})
  }, [tripData.distance, tripData.duration, tripData.fromCoords, tripData.toCoords, bookingData.departureDate, bookingData.departureTime, forfaits, configPrix, tollCost])


  const [jourOffError, setJourOffError] = useState('')

  const handleBookingChange = (field: keyof BookingData, value: any) => {
    if (field === 'departureDate' && configPrix.joursOff.includes(value)) {
      setJourOffError('Nous sommes indisponibles ce jour-là. Merci de choisir une autre date ou de nous appeler au 06 67 23 78 22.')
      return
    }
    if (field === 'departureDate') setJourOffError('')
    setBookingData(prev => ({ ...prev, [field]: value }))
  }

  // Fonction pour ajuster le scroll de manière intelligente (solution robuste)
  const scrollToModule = () => {
    // Solution double : setTimeout + scrollIntoView (plus fiable selon recherches web)
    setTimeout(() => {
      const reservationElement = document.getElementById('reservation-title')
      if (reservationElement) {
        reservationElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      } else if (moduleRef.current) {
        // Fallback vers l'ancienne méthode
        const element = moduleRef.current
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight
        
        if (!isVisible) {
          const offsetTop = element.offsetTop - 100
          window.scrollTo({
            top: Math.max(0, offsetTop),
            behavior: 'smooth'
          })
        }
      }
    }, 0) // 0ms delay comme recommandé dans les recherches
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
          priceDetails: tripData.priceDetails,
          prixBarreDegressif: prixSansDegressif > 0 ? prixSansDegressif : null,
          fourchette: (tripData.priceDetails?.isForfait || prixSansDegressif > 0)
            ? null
            : tripData.price <= configPrix.courseMini
              ? { de: configPrix.courseMiniDe || 0, a: configPrix.courseMini || 0 }
              : { de: (tripData.price || 0) - (configPrix.fraisApproche || 0), a: tripData.price || 0 }
        },
        bookingDetails: {
          passengers: bookingData.passengers,
          luggage: bookingData.luggage,
          notes: bookingData.notes
        },
        estimatedPickupTime: pickupTime.toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        next_steps: [
          "Votre réservation a été confirmée",
          "Un chauffeur sera assigné avant l'heure de prise en charge",
          "Vous recevrez un email avec les détails du véhicule",
          "Pour toute modification, appelez le +33 6 67 23 78 22"
        ]
      }

      // Sauvegarde en base + Google Calendar
      fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reservationData,
          pickupDate: pickupTime.toISOString(),
        })
      }).catch(() => {})

      // Notification Telegram
      fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reservation', payload: reservationData })
      }).catch(() => {})

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
      setStep(totalSteps)

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'funnel_step', { event_category: 'funnel', step: 'confirmed', price: tripData.price, from: tripData.from?.split(',')[0], to: tripData.to?.split(',')[0] })
      }
      
      // Solution robuste pour le scroll après confirmation (fix problème navigateurs Chrome/Chromium)
      setTimeout(() => {
        const reservationElement = document.getElementById('reservation-title')
        if (reservationElement) {
          // Méthode 1: scrollIntoView avec setTimeout (solution la plus fiable selon recherches)
          reservationElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
        } else {
          // Méthode de fallback: scroll manuel si l'élément n'est pas trouvé
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      }, 100)

    } catch (error) {
      console.error('Erreur soumission réservation:', error)
      setError('Erreur lors de la création de la réservation. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Interface étape 1 avec toutes les infos nécessaires pour le calcul de prix
  const renderStep1 = () => (
    <div className="space-y-3">

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Formulaire complet */}
      <div className="grid gap-4">
        {/* Colonne gauche - Formulaire */}
        <div className="space-y-3 min-w-0">

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="min-w-0 overflow-hidden">
              <label className="block text-sm font-medium text-gray-800 mb-2 truncate">
                <Calendar className="inline w-4 h-4 mr-1 shrink-0" />
                {t('departureDate')}
                {validationAttempted && !bookingData.departureDate && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="date"
                value={bookingData.departureDate}
                onChange={(e) => handleBookingChange('departureDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full min-w-0 p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-base text-gray-900 ${jourOffError ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {jourOffError && <p className="text-red-500 text-xs mt-1">{jourOffError}</p>}
            </div>

            <div className="min-w-0 overflow-hidden">
              <label className="block text-sm font-medium text-gray-800 mb-2 truncate">
                <Clock className="inline w-4 h-4 mr-1 shrink-0" />
                {t('departureTime')}
                {validationAttempted && !bookingData.departureTime && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="time"
                value={bookingData.departureTime}
                onChange={(e) => handleBookingChange('departureTime', e.target.value)}
                className="w-full min-w-0 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-base text-gray-900"
                required
              />
            </div>
          </div>

          {/* Adresses */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-green-500" />
              {t('fromLabel')}
              {validationAttempted && !tripData.fromCoords && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2">
              <input
                ref={fromInputRef}
                type="text"
                placeholder={t('fromPlaceholder')}
                value={tripData.from}
                onFocus={loadGoogleMapsLazy}
                onChange={(e) => setTripData(prev => ({ ...prev, from: e.target.value }))}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={async () => {
                  if (!navigator.geolocation) return
                  setLoading(true)
                  const onSuccess = async (pos: GeolocationPosition) => {
                    try {
                      await loadGoogleMapsLazy()
                      const geocoder = new (window as any).google.maps.Geocoder()
                      const result = await geocoder.geocode({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } })
                      if (result.results[0]) {
                        const addr = result.results[0].formatted_address
                        setTripData(prev => ({ ...prev, from: addr, fromCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }))
                        if (fromInputRef.current) fromInputRef.current.value = addr
                      }
                    } catch { }
                    setLoading(false)
                  }
                  const onError = () => {
                    setLoading(false)
                    alert('Impossible de vous localiser. Vérifiez que la localisation est activée dans les paramètres de votre navigateur.')
                  }
                  navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 })
                }}
                disabled={loading}
                className="px-3 py-3 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 shrink-0"
                title={t('geolocate') || 'Me localiser'}
              >
                <Crosshair size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-red-500" />
              {t('toLabel')}
              {validationAttempted && !tripData.toCoords && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              ref={toInputRef}
              type="text"
              placeholder={t('toPlaceholder')}
              value={tripData.to}
              onFocus={loadGoogleMapsLazy}
              onChange={(e) => setTripData(prev => ({ ...prev, to: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
              disabled={loading}
              required
            />
          </div>

          {/* Passagers et bagages - sliders */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 pb-3">
            <div className="min-w-0">
              <span className="text-sm text-gray-600 mb-2 block">{t('passengers')} : {bookingData.passengers}</span>
              <input
                type="range"
                min={1}
                max={8}
                value={bookingData.passengers}
                onChange={(e) => handleBookingChange('passengers', parseInt(e.target.value))}
                className="slider-styled w-full"
              />
            </div>

            <div className="min-w-0">
              <span className="text-sm text-gray-600 mb-2 block">{t('luggage')} : {bookingData.luggage}</span>
              <input
                type="range"
                min={0}
                max={5}
                value={bookingData.luggage}
                onChange={(e) => handleBookingChange('luggage', parseInt(e.target.value))}
                className="slider-styled w-full"
              />
            </div>
          </div>

          {/* Carte masquée — le div reste dans le DOM pour l'initialisation Google Maps */}

          {/* Informations de trajet */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center">
                <Loader2 className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                {t('calculatingRoute')}
              </div>
            </div>
          )}

          {tripData.distance > 0 && bookingData.departureDate && bookingData.departureTime && needsCapture && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                {t('routeEstimate')}
              </h3>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('distance')}</span>
                  <div className="font-semibold text-lg text-gray-900">{(tripData.distance || 0).toFixed(1)} km</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('duration')}</span>
                  <div className="font-semibold text-lg text-gray-900">{Math.round(tripData.duration || 0)} min</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('passengers')}</span>
                  <div className="font-semibold text-lg text-gray-900">{bookingData.passengers}</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('luggage')}</span>
                  <div className="font-semibold text-lg text-gray-900">{bookingData.luggage}</div>
                </div>
              </div>
            </div>
          )}

          {tripData.distance > 0 && tripData.price > 0 && bookingData.departureDate && bookingData.departureTime && !needsCapture && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Route className="w-5 h-5 mr-2" />
                {t('routeEstimate')}
              </h3>
              <div className="grid grid-cols-4 gap-2 text-sm mb-4">
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('distance')}</span>
                  <div className="font-semibold text-lg text-gray-900">{(tripData.distance || 0).toFixed(1)} km</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('duration')}</span>
                  <div className="font-semibold text-lg text-gray-900">{Math.round(tripData.duration || 0)} min</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('passengers')}</span>
                  <div className="font-semibold text-lg text-gray-900">{bookingData.passengers}</div>
                </div>
                <div className="text-center">
                  <span className="text-gray-900 sm:text-gray-600 block">{t('luggage')}</span>
                  <div className="font-semibold text-lg text-gray-900">{bookingData.luggage}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-green-200">
                <span className="block text-center text-gray-900 sm:text-gray-600 text-sm mb-2">{t('estimatedPrice')} :</span>
                {prixSansDegressif > 0 && (
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-sm text-gray-400 line-through">{prixSansDegressif.toFixed(0)}€</span>
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Tarif réduit</span>
                  </div>
                )}
                {prixAvantRemise > 0 ? (
                  <>
                    {prixSansDegressif === 0 && (
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="text-sm text-gray-400 line-through">{prixAvantRemise.toFixed(0)}€</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{configPrix.remisePourcentage}%</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-extrabold tracking-tight text-green-700">{(tripData.price || 0).toFixed(2)}€</span>
                    </div>
                  </>
                ) : (
                <div className="flex items-center justify-center gap-2">
                  {tripData.priceDetails?.isForfait || prixSansDegressif > 0
                    ? <span className="text-3xl font-extrabold tracking-tight text-green-700">{(tripData.price || 0).toFixed(2)}€</span>
                    : tripData.price <= configPrix.courseMini
                      ? <>
                          <span className="text-3xl font-extrabold tracking-tight text-green-700">{(configPrix.courseMiniDe || 0).toFixed(2)}€</span>
                          <span className="text-green-700 text-lg mx-1">à</span>
                          <span className="text-3xl font-extrabold tracking-tight text-green-700">{(configPrix.courseMini || 0).toFixed(2)}€</span>
                        </>
                      : <>
                          <span className="text-3xl font-extrabold tracking-tight text-green-700">{((tripData.price || 0) - (configPrix.fraisApproche || 0)).toFixed(2)}€</span>
                          <span className="text-green-700 text-lg mx-1">à</span>
                          <span className="text-3xl font-extrabold tracking-tight text-green-700">{(tripData.price || 0).toFixed(2)}€</span>
                        </>
                  }
                </div>
                )}
                {tripData.priceDetails && tripData.priceDetails.tariffType !== 'Jour' && (
                  <div className="flex items-center justify-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tripData.priceDetails.tariffType === 'Nuit' ? 'bg-blue-200 sm:bg-blue-100 text-blue-900 sm:text-blue-800' :
                      tripData.priceDetails.tariffType === 'Férié' ? 'bg-red-200 sm:bg-red-100 text-red-900 sm:text-red-800' :
                      tripData.priceDetails.tariffType === 'Dimanche' ? 'bg-purple-200 sm:bg-purple-100 text-purple-900 sm:text-purple-800' :
                      'bg-green-200 sm:bg-green-100 text-green-900 sm:text-green-800'
                    }`}>
                      {t('tariffLabel')} {getTariffLabel(tripData.priceDetails.tariffType ?? '')}
                    </span>
                  </div>
                )}
                {tollCost > 0 && !tripData.priceDetails?.isForfait && (
                  <div className="text-center text-slate-500 text-xs mt-2">
                    Dont {tollCost.toFixed(2)}€ de péage inclus
                  </div>
                )}
                {!bookingData.departureDate || !bookingData.departureTime ? (
                  <div className="text-center text-orange-600 font-medium text-xs mt-2">{t('priceFineWithDateTime')}</div>
                ) : null}
                <div className="flex items-center justify-center mt-3 opacity-60">
                  <img src="/images/cb-logos.png" alt="Visa, CB, Mastercard, American Express" className="h-5" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Colonne droite - Carte (cachée, gardée pour initialisation Google Maps) */}
        <div className="hidden">
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
                  <span className="flex items-center text-green-800 sm:text-green-600">
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
          setValidationAttempted(true)

          const allFieldsValid = tripData.fromCoords && tripData.toCoords &&
                                bookingData.departureDate && bookingData.departureTime &&
                                bookingData.passengers && tripData.price && !jourOffError

          if (allFieldsValid) {
            setStep(2)
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'funnel_step', { event_category: 'funnel', step: needsCapture ? 'step1_to_capture' : 'step1_to_step2', from: tripData.from?.split(',')[0], to: tripData.to?.split(',')[0], price: tripData.price })
            }
            setTimeout(scrollToModule, 150)
          }
        }}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        <Navigation className="w-5 h-5 mr-2" />
        {!tripData.fromCoords || !tripData.toCoords ? t('selectAddresses') :
         !bookingData.departureDate || !bookingData.departureTime ? t('dateTimeRequired') :
         jourOffError ? 'Date indisponible' :
         !tripData.price ? t('calculatingPrice') :
         needsCapture ? 'Continuer' :
         t('bookNowBtn')}
      </button>

      {/* ── Lien devis discret sous le CTA ── */}
      {tripData.distance > 0 && tripData.price > 0 && bookingData.departureDate && bookingData.departureTime && !needsCapture && (
        <EmailCaptureForm
          estimationId={estimationId}
          tripFrom={tripData.from}
          tripTo={tripData.to}
          price={tripData.price}
          tariffType={tripData.priceDetails?.tariffType ?? 'Jour'}
          distance={tripData.distance}
          duration={tripData.duration}
          departureDate={bookingData.departureDate}
          departureTime={bookingData.departureTime}
          passengers={bookingData.passengers}
          isForfait={tripData.priceDetails?.isForfait ?? false}
        />
      )}
    </div>
  )

  // Soumission lead capture
  const submitLeadCapture = async () => {
    setLoading(true)
    setError('')
    try {
      const reservationId = 'TBS-' + Date.now().toString().slice(-6)
      const pickupTime = new Date(bookingData.departureDate + 'T' + bookingData.departureTime)

      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          status: 'lead_capture',
          customer: {
            name: leadFirstname,
            phone: leadPhone,
            email: leadEmail || '',
          },
          trip: {
            from: { address: tripData.from },
            to: { address: tripData.to },
            distance: tripData.distance,
          },
          pricing: {
            totalPrice: tripData.price,
            priceDetails: tripData.priceDetails,
            fourchette: (tripData.priceDetails?.isForfait || prixSansDegressif > 0)
              ? null
              : tripData.price <= configPrix.courseMini
                ? { de: configPrix.courseMiniDe || 0, a: configPrix.courseMini || 0 }
                : { de: (tripData.price || 0) - (configPrix.fraisApproche || 0), a: tripData.price || 0 }
          },
          bookingDetails: {
            passengers: bookingData.passengers,
            luggage: bookingData.luggage,
          },
          pickupDate: pickupTime.toISOString(),
        })
      })

      setBookingData(prev => ({
        ...prev,
        customerName: leadFirstname,
        customerPhone: leadPhone,
        customerEmail: leadEmail,
      }))

      setStep(3)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'funnel_step', { event_category: 'funnel', step: 'capture_to_price', from: tripData.from?.split(',')[0], to: tripData.to?.split(',')[0], price: tripData.price })
      }
      setTimeout(scrollToModule, 150)
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Interface étape capture lead (longue distance)
  const renderLeadCapture = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <Phone className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Plus qu{"'"}une étape pour votre devis</h3>
        <p className="text-gray-600 text-sm">
          {tripData.from?.split(',')[0]} → {tripData.to?.split(',')[0]} · {(tripData.distance || 0).toFixed(1)} km
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            <Users className="inline w-4 h-4 mr-1" />
            Prénom *
            {leadCaptureValidationAttempted && leadFirstname.trim().length < 2 && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            placeholder="Votre prénom"
            value={leadFirstname}
            onChange={(e) => setLeadFirstname(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />
          {leadCaptureValidationAttempted && leadFirstname.trim().length < 2 && (
            <p className="text-red-500 text-xs mt-1">Le prénom doit contenir au moins 2 caractères</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Téléphone *
            {leadCaptureValidationAttempted && !leadPhone.replace(/[\s.-]/g, '').match(/^(?:\+33|0)[1-9][0-9]{8}$/) && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="tel"
            placeholder="06 12 34 56 78"
            value={leadPhone}
            onChange={(e) => setLeadPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />
          {leadCaptureValidationAttempted && !leadPhone.replace(/[\s.-]/g, '').match(/^(?:\+33|0)[1-9][0-9]{8}$/) && (
            <p className="text-red-500 text-xs mt-1">Numéro de téléphone français invalide</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email (optionnel)
          </label>
          <input
            type="email"
            placeholder="votre@email.fr"
            value={leadEmail}
            onChange={(e) => setLeadEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          />
          {leadCaptureValidationAttempted && leadEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail) && (
            <p className="text-red-500 text-xs mt-1">Format d{"'"}email invalide</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
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
            setLeadCaptureValidationAttempted(true)

            const firstnameValid = leadFirstname.trim().length >= 2
            const phoneValid = /^(?:\+33|0)[1-9][0-9]{8}$/.test(leadPhone.replace(/[\s.-]/g, ''))
            const emailValid = !leadEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail)

            if (firstnameValid && phoneValid && emailValid && !loading) {
              submitLeadCapture()
            }
          }}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Envoi...
            </>
          ) : (
            <>
              <Euro className="w-5 h-5 mr-2" />
              Voir mon prix
            </>
          )}
        </button>
      </div>
    </div>
  )

  // Interface étape 2 - Résumé de la réservation
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('step2Summary')}</h3>
        <p className="text-gray-900 sm:text-gray-600">{t('step2Subtitle')}</p>
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
                  <div className="font-medium text-gray-900">{t('journey')}</div>
                  <div className="text-sm text-gray-900 sm:text-gray-600">
                    {tripData.from?.split(',')[0]} → {tripData.to?.split(',')[0]}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{(tripData.distance || 0).toFixed(1)} km</div>
                <div className="text-sm text-gray-900 sm:text-gray-600">{Math.round(tripData.duration || 0)} min</div>
              </div>
            </div>

            {/* Date et heure */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t('pickup')}</div>
                  <div className="text-sm text-gray-900 sm:text-gray-600">
                    {t('pickupOn')} {new Date(bookingData.departureDate).toLocaleDateString(dateLocale)} {t('pickupAt')} {bookingData.departureTime}
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
                  <div className="font-medium text-gray-900">{t('details')}</div>
                  <div className="text-sm text-gray-900 sm:text-gray-600">
                    {bookingData.passengers} {bookingData.passengers > 1 ? t('passengerPlural') : t('passengerSingular')} • {bookingData.luggage} {bookingData.luggage > 1 ? t('luggagePlural') : t('luggageSingular')}
                  </div>
                </div>
              </div>
            </div>

            {/* Prix */}
            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <div className="text-center">
                <div className="text-sm text-green-800 sm:text-green-600 mb-1">{t('totalPriceLabel')}</div>
                {prixSansDegressif > 0 && (
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-sm text-gray-400 line-through">{prixSansDegressif.toFixed(0)}€</span>
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Tarif réduit</span>
                  </div>
                )}
                {prixAvantRemise > 0 ? (
                  <>
                    {prixSansDegressif === 0 && (
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="text-sm text-gray-400 line-through">{prixAvantRemise.toFixed(0)}€</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{configPrix.remisePourcentage}%</span>
                      </div>
                    )}
                    <div className="text-3xl font-bold text-green-700">
                      {(tripData.price || 0).toFixed(2)}€
                    </div>
                  </>
                ) : (
                <div className="text-3xl font-bold text-green-700">
                  {tripData.priceDetails?.isForfait || prixSansDegressif > 0
                    ? `${(tripData.price || 0).toFixed(2)}€`
                    : tripData.price <= configPrix.courseMini
                      ? `${(configPrix.courseMiniDe || 0).toFixed(2)}€ à ${(configPrix.courseMini || 0).toFixed(2)}€`
                      : `${((tripData.price || 0) - (configPrix.fraisApproche || 0)).toFixed(2)}€ à ${(tripData.price || 0).toFixed(2)}€`
                  }
                </div>
                )}
                {tripData.priceDetails && tripData.priceDetails.tariffType && tripData.priceDetails.tariffType !== 'Jour' && (
                  <div className="text-xs text-blue-800 sm:text-blue-600 mt-2 font-medium">
                    ✓ {t('tariffLabel')} {getTariffLabel(tripData.priceDetails.tariffType ?? '')} {t('tariffApplied')}
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
            setStep(needsCapture ? 2 : 1)
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'funnel_abandon', { event_category: 'funnel', step: 'summary_back' })
            }
            setTimeout(scrollToModule, 150)
          }}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={() => {
            setStep(needsCapture ? 4 : 3)
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'funnel_step', { event_category: 'funnel', step: 'summary_to_details' })
            }
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
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              {t('fullName')}
              {step3ValidationAttempted && !bookingData.customerName && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              placeholder={t('fullName')}
              value={bookingData.customerName}
              onChange={(e) => handleBookingChange('customerName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Phone className="inline w-4 h-4 mr-1" />
              {t('phone')}
              {step3ValidationAttempted && !bookingData.customerPhone && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={bookingData.customerPhone}
              onChange={(e) => handleBookingChange('customerPhone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              {t('email')}
            </label>
            <input
              type="email"
              placeholder={language === 'en' ? 'your@email.com' : language === 'es' ? 'su@email.com' : 'votre@email.fr'}
              value={bookingData.customerEmail}
              onChange={(e) => handleBookingChange('customerEmail', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('notes')}
            </label>
            <textarea
              placeholder={t('notesPlaceholder')}
              value={bookingData.notes}
              onChange={(e) => handleBookingChange('notes', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Résumé de commande */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{t('bookingDetails')}</h3>
          <div className="space-y-3 text-sm text-gray-900">
            <div className="flex justify-between">
              <span>{t('tripLabel')}</span>
              <span className="font-medium text-right">
                {tripData.from?.split(',')[0]} → {tripData.to?.split(',')[0]}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('distanceLabel')}</span>
              <span className="font-medium">{(tripData.distance || 0).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span>{t('durationLabel')}</span>
              <span className="font-medium">{Math.round(tripData.duration || 0)} min</span>
            </div>
            <div className="flex justify-between">
              <span>{t('dateLabel')}</span>
              <span className="font-medium">{new Date(bookingData.departureDate).toLocaleDateString(dateLocale)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('timeLabel')}</span>
              <span className="font-medium">{bookingData.departureTime}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('passengersLabel')}</span>
              <span className="font-medium">{bookingData.passengers}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('luggageLabel')}</span>
              <span className="font-medium">{bookingData.luggage}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('totalPrice')}:</span>
              <div className="text-right">
                {prixSansDegressif > 0 && (
                  <div className="flex items-center justify-end gap-1 mb-0.5">
                    <span className="text-xs text-gray-400 line-through font-normal">{prixSansDegressif.toFixed(0)}€</span>
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Tarif réduit</span>
                  </div>
                )}
                {prixAvantRemise > 0 ? (
                  <>
                    {prixSansDegressif === 0 && (
                      <div className="flex items-center justify-end gap-1 mb-0.5">
                        <span className="text-xs text-gray-400 line-through font-normal">{prixAvantRemise.toFixed(0)}€</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{configPrix.remisePourcentage}%</span>
                      </div>
                    )}
                    <span className="text-green-800 sm:text-green-600 font-semibold">
                      {(tripData.price || 0).toFixed(2)}€
                    </span>
                  </>
                ) : (
                <span className="text-green-800 sm:text-green-600 font-semibold">
                  {tripData.priceDetails?.isForfait || prixSansDegressif > 0
                    ? `${(tripData.price || 0).toFixed(2)}€`
                    : tripData.price <= configPrix.courseMini
                      ? `${(configPrix.courseMiniDe || 0).toFixed(2)}€ à ${(configPrix.courseMini || 0).toFixed(2)}€`
                      : `${((tripData.price || 0) - (configPrix.fraisApproche || 0)).toFixed(2)}€ à ${(tripData.price || 0).toFixed(2)}€`
                  }
                </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setStep(needsCapture ? 3 : 2)
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'funnel_abandon', { event_category: 'funnel', step: 'details_back_to_summary' })
            }
            setTimeout(scrollToModule, 150)
          }}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={() => {
            setStep3ValidationAttempted(true)

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
          <h4 className="font-semibold text-gray-900 mb-4">{t('bookingDetails')}</h4>
          <div className="space-y-2 text-sm text-gray-900 text-left">
            <div><strong>{t('reservationNumber')} :</strong> {reservation.reservationId}</div>
            <div><strong>{t('clientLabel')}</strong> {reservation.customer.name}</div>
            <div><strong>{t('phoneLabel')}</strong> {reservation.customer.phone}</div>
            <div><strong>{t('tripLabel')}</strong> {(typeof reservation.trip.from === 'string' ? reservation.trip.from : reservation.trip.from?.address || '').split(',')[0]} → {(typeof reservation.trip.to === 'string' ? reservation.trip.to : reservation.trip.to?.address || '').split(',')[0]}</div>
            <div><strong>{t('priceLabel')}</strong> {reservation.pricing.totalPrice.toFixed(2)}€</div>
            <div><strong>{t('distanceLabel')}</strong> {reservation.trip.distance.toFixed(1)} km</div>
            <div><strong>{t('pickupLabel')}</strong> {reservation.estimatedPickupTime}</div>
          </div>
        </div>
      )}

      {/* Prochaines étapes */}
      {reservation && reservation.next_steps && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h4 className="font-semibold text-blue-800 mb-3">{t('nextSteps')}</h4>
          <ul className="text-sm text-blue-900 sm:text-blue-700 space-y-2 text-left">
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
          setTollCost(0)
          setBookingData({
            passengers: 1,
            luggage: 0,
            departureDate: '',
            departureTime: '',
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            notes: '',
            language: language
          })
          setReservation(null)
          setEstimationId(null)
          setSuccess('')
          setError('')
          setValidationAttempted(false)
          setStep3ValidationAttempted(false)
          setLeadFirstname('')
          setLeadPhone('')
          setLeadEmail('')
          setLeadCaptureValidationAttempted(false)
        }}
        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {t('newBooking')}
      </button>
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-2xl border-2 border-blue-300 p-3 sm:p-4 lg:p-4 w-full relative mx-auto max-w-7xl my-4" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'}}>
      {/* Ancre invisible pour le scroll avec offset */}
      <div id="reservation" className="absolute -top-20"></div>

      <div ref={moduleRef}>
      {/* Header compact */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-full mr-3">
            <Car className="w-5 h-5 text-white" />
          </div>
          <h2 id="reservation-title" className="text-lg lg:text-xl font-bold text-gray-800">{t('bookNow')} <span className="text-green-600">{t('bookNowHighlight')}</span></h2>
        </div>
        <LanguageSelector />
      </div>

      {/* Indicateur d'étapes — masqué à l'étape 1 */}
      {step > 1 && (
      <div className="flex justify-center mb-4">
        <div className="flex items-center space-x-3">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-300 sm:bg-gray-200 text-gray-900 sm:text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < totalSteps && <div className={`w-6 h-0.5 transition-colors ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Contenu principal */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-5 w-full">
        {step === 1 && renderStep1()}
        {step === 2 && (needsCapture ? renderLeadCapture() : renderStep2())}
        {step === 3 && (needsCapture ? renderStep2() : renderStep3())}
        {step === 4 && (needsCapture ? renderStep3() : renderStep4())}
        {step === 5 && renderStep4()}
      </div>

      {/* Note d'information */}
      {step < totalSteps && (
        <div className="mt-2 text-center text-xs text-gray-800 sm:text-gray-500">
          <p className="text-blue-600 font-medium">{t('requiredFields')}</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default TaxiBookingHomePreview