/**
 * CONFIGURATION GOOGLE MAPS API
 * Service complet pour géocodage, directions et places
 */

import { Client } from '@googlemaps/google-maps-services-js'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

let mapsClient = null

/**
 * Configuration et initialisation Google Maps
 */
export const setupGoogleMaps = () => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      logger.warn('⚠️ GOOGLE_MAPS_API_KEY non définie - fonctionnalités cartographiques désactivées')
      return null
    }

    mapsClient = new Client({
      config: {
        timeout: 10000, // 10 secondes timeout
        retry: true,
        retryOptions: {
          retries: 3,
          retryDelay: 1000
        }
      }
    })

    logger.info('✅ Google Maps API client initialisé', {
      hasApiKey: !!apiKey,
      restrictedDomains: process.env.GOOGLE_MAPS_RESTRICTED_DOMAINS?.split(',') || []
    })

    return mapsClient
  } catch (error) {
    logger.error('❌ Erreur initialisation Google Maps', { error: error.message })
    throw error
  }
}

/**
 * Service Google Maps complet
 */
export class GoogleMapsService {
  constructor(client, apiKey) {
    this.client = client
    this.apiKey = apiKey
    this.requestsToday = 0
    this.dailyLimit = parseInt(process.env.GOOGLE_MAPS_DAILY_LIMIT) || 25000
    this.bordeauxBounds = {
      northeast: { lat: 44.95, lng: -0.4 },
      southwest: { lat: 44.7, lng: -0.8 }
    }
  }

  /**
   * Vérifier les limites de quota
   */
  checkQuota() {
    if (this.requestsToday >= this.dailyLimit) {
      throw new Error('Quota journalier Google Maps atteint')
    }
    return true
  }

  /**
   * Incrémenter le compteur de requêtes
   */
  incrementRequests() {
    this.requestsToday++
    logger.debug('Google Maps request count', { 
      used: this.requestsToday, 
      limit: this.dailyLimit,
      remaining: this.dailyLimit - this.requestsToday
    })
  }

  /**
   * Géocodage d'adresse avec préférence Bordeaux
   */
  async geocodeAddress(address, language = 'fr') {
    try {
      this.checkQuota()
      
      const params = {
        address: address,
        key: this.apiKey,
        language: language,
        region: 'fr',
        bounds: `${this.bordeauxBounds.southwest.lat},${this.bordeauxBounds.southwest.lng}|${this.bordeauxBounds.northeast.lat},${this.bordeauxBounds.northeast.lng}`,
        components: 'country:FR'
      }

      logger.debug('Géocodage adresse', { address, language })
      
      const response = await this.client.geocode({ params })
      this.incrementRequests()

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0]
        
        return {
          success: true,
          address: result.formatted_address,
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          },
          placeId: result.place_id,
          types: result.types,
          components: result.address_components,
          bounds: result.geometry.bounds,
          locationType: result.geometry.location_type,
          partialMatch: result.partial_match || false
        }
      }

      return {
        success: false,
        error: 'Adresse non trouvée',
        status: response.data.status
      }

    } catch (error) {
      logger.error('Erreur géocodage', { error: error.message, address })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Géocodage inverse (coordonnées vers adresse)
   */
  async reverseGeocode(lat, lng, language = 'fr') {
    try {
      this.checkQuota()
      
      const params = {
        latlng: `${lat},${lng}`,
        key: this.apiKey,
        language: language,
        region: 'fr',
        result_type: 'street_address|route|locality'
      }

      logger.debug('Géocodage inverse', { lat, lng, language })
      
      const response = await this.client.reverseGeocode({ params })
      this.incrementRequests()

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0]
        
        return {
          success: true,
          address: result.formatted_address,
          coordinates: { lat, lng },
          placeId: result.place_id,
          types: result.types,
          components: result.address_components
        }
      }

      return {
        success: false,
        error: 'Coordonnées non résolues',
        status: response.data.status
      }

    } catch (error) {
      logger.error('Erreur géocodage inverse', { error: error.message, lat, lng })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Calcul d'itinéraire avec trafic temps réel
   */
  async calculateRoute(origin, destination, options = {}) {
    try {
      this.checkQuota()
      
      const params = {
        origin: typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`,
        destination: typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`,
        key: this.apiKey,
        mode: 'driving',
        language: options.language || 'fr',
        region: 'fr',
        units: 'metric',
        departure_time: options.departureTime || 'now',
        traffic_model: 'best_guess',
        avoid: options.avoid || [],
        alternatives: options.alternatives || false
      }

      // Only add waypoints if explicitly provided and valid
      if (options.waypoints && Array.isArray(options.waypoints) && options.waypoints.length > 0) {
        params.waypoints = options.waypoints.map(waypoint => {
          if (typeof waypoint === 'string') {
            return waypoint
          }
          if (waypoint && waypoint.lat && waypoint.lng) {
            return `${waypoint.lat},${waypoint.lng}`
          }
          return waypoint
        }).filter(waypoint => waypoint) // Remove any null/undefined waypoints
      }

      logger.debug('Calcul itinéraire', { 
        origin: params.origin, 
        destination: params.destination,
        options: options
      })
      
      const response = await this.client.directions({ params })
      this.incrementRequests()

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0]
        const leg = route.legs[0]
        
        return {
          success: true,
          distance: leg.distance.value / 1000, // en km
          duration: leg.duration.value / 60, // en minutes
          durationInTraffic: leg.duration_in_traffic ? leg.duration_in_traffic.value / 60 : null,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          startLocation: leg.start_location,
          endLocation: leg.end_location,
          polyline: route.overview_polyline.points,
          bounds: route.bounds,
          steps: leg.steps.map(step => ({
            distance: step.distance,
            duration: step.duration,
            instructions: step.html_instructions.replace(/<[^>]*>/g, ''),
            maneuver: step.maneuver,
            startLocation: step.start_location,
            endLocation: step.end_location
          })),
          warnings: route.warnings || [],
          alternatives: response.data.routes.slice(1).map(alt => ({
            distance: alt.legs[0].distance.value / 1000,
            duration: alt.legs[0].duration.value / 60,
            summary: alt.summary
          }))
        }
      }

      return {
        success: false,
        error: 'Itinéraire non trouvé',
        status: response.data.status
      }

    } catch (error) {
      logger.error('Erreur calcul itinéraire', { error: error.message, origin, destination })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Suggestions d'adresses (Places Autocomplete)
   */
  async placeAutocomplete(input, language = 'fr') {
    try {
      this.checkQuota()
      
      const params = {
        input: input,
        key: this.apiKey,
        language: language,
        location: '44.8378,-0.5792', // Centre de Bordeaux
        radius: 50000, // 50km autour de Bordeaux
        components: 'country:fr',
        types: 'address'
      }

      logger.debug('Places Autocomplete', { input, language })
      
      const response = await this.client.placeAutocomplete({ params })
      this.incrementRequests()

      if (response.data.status === 'OK') {
        return {
          success: true,
          predictions: response.data.predictions.map(prediction => ({
            description: prediction.description,
            placeId: prediction.place_id,
            structuredFormatting: prediction.structured_formatting,
            types: prediction.types,
            terms: prediction.terms
          }))
        }
      }

      return {
        success: false,
        error: 'Aucune suggestion trouvée',
        status: response.data.status
      }

    } catch (error) {
      logger.error('Erreur Places Autocomplete', { error: error.message, input })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Détails d'un lieu par Place ID
   */
  async placeDetails(placeId, language = 'fr') {
    try {
      this.checkQuota()
      
      const params = {
        place_id: placeId,
        key: this.apiKey,
        language: language,
        fields: [
          'formatted_address',
          'geometry',
          'name',
          'place_id',
          'types',
          'address_components'
        ]
      }

      logger.debug('Place Details', { placeId, language })
      
      const response = await this.client.placeDetails({ params })
      this.incrementRequests()

      if (response.data.status === 'OK') {
        const result = response.data.result
        
        return {
          success: true,
          name: result.name,
          address: result.formatted_address,
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          },
          placeId: result.place_id,
          types: result.types,
          components: result.address_components
        }
      }

      return {
        success: false,
        error: 'Lieu non trouvé',
        status: response.data.status
      }

    } catch (error) {
      logger.error('Erreur Place Details', { error: error.message, placeId })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Matrice de distances entre plusieurs points
   */
  async distanceMatrix(origins, destinations, options = {}) {
    try {
      this.checkQuota()
      
      const params = {
        origins: Array.isArray(origins) ? origins : [origins],
        destinations: Array.isArray(destinations) ? destinations : [destinations],
        key: this.apiKey,
        mode: 'driving',
        language: options.language || 'fr',
        units: 'metric',
        departure_time: options.departureTime || 'now',
        traffic_model: 'best_guess',
        avoid: options.avoid || []
      }

      logger.debug('Distance Matrix', { 
        origins: params.origins.length, 
        destinations: params.destinations.length
      })
      
      const response = await this.client.distancematrix({ params })
      this.incrementRequests()

      if (response.data.status === 'OK') {
        return {
          success: true,
          rows: response.data.rows.map((row, originIndex) => ({
            originAddress: response.data.origin_addresses[originIndex],
            elements: row.elements.map((element, destIndex) => ({
              destinationAddress: response.data.destination_addresses[destIndex],
              distance: element.distance ? element.distance.value / 1000 : null,
              duration: element.duration ? element.duration.value / 60 : null,
              durationInTraffic: element.duration_in_traffic ? element.duration_in_traffic.value / 60 : null,
              status: element.status
            }))
          }))
        }
      }

      return {
        success: false,
        error: 'Calcul matrice échoué',
        status: response.data.status
      }

    } catch (error) {
      logger.error('Erreur Distance Matrix', { error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Trouver des lieux à proximité
   */
  async nearbySearch(location, radius = 5000, type = 'point_of_interest', language = 'fr') {
    try {
      this.checkQuota()
      
      const params = {
        location: typeof location === 'string' ? location : `${location.lat},${location.lng}`,
        radius: radius,
        type: type,
        key: this.apiKey,
        language: language
      }

      logger.debug('Nearby Search', { location: params.location, radius, type })
      
      const response = await this.client.placesNearby({ params })
      this.incrementRequests()

      if (response.data.status === 'OK') {
        return {
          success: true,
          places: response.data.results.map(place => ({
            name: place.name,
            placeId: place.place_id,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            types: place.types,
            rating: place.rating,
            vicinity: place.vicinity,
            openNow: place.opening_hours?.open_now
          }))
        }
      }

      return {
        success: false,
        error: 'Aucun lieu trouvé',
        status: response.data.status
      }

    } catch (error) {
      logger.error('Erreur Nearby Search', { error: error.message, location })
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Valider une adresse dans la zone de service
   */
  isInServiceArea(coordinates) {
    const { lat, lng } = coordinates
    const bounds = this.bordeauxBounds
    
    return lat >= bounds.southwest.lat && 
           lat <= bounds.northeast.lat && 
           lng >= bounds.southwest.lng && 
           lng <= bounds.northeast.lng
  }

  /**
   * Statistiques d'utilisation
   */
  getUsageStats() {
    return {
      requestsToday: this.requestsToday,
      dailyLimit: this.dailyLimit,
      remaining: this.dailyLimit - this.requestsToday,
      usagePercent: Math.round((this.requestsToday / this.dailyLimit) * 100)
    }
  }

  /**
   * Reset quotas (appelé quotidiennement)
   */
  resetDailyQuota() {
    this.requestsToday = 0
    logger.info('Google Maps daily quota reset')
  }
}

/**
 * Instance globale du service Maps
 */
export const getMapsService = () => {
  if (!mapsClient || !process.env.GOOGLE_MAPS_API_KEY) {
    logger.warn('Service Google Maps non disponible')
    return null
  }
  return new GoogleMapsService(mapsClient, process.env.GOOGLE_MAPS_API_KEY)
}

export { mapsClient }
export default { setupGoogleMaps, getMapsService, GoogleMapsService }