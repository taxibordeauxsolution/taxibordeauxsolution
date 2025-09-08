/**
 * SERVICE GOOGLE MAPS AVANCÉ
 * Intégration complète avec cache Redis et gestion d'erreurs
 */

import { getMapsService } from '../config/maps.js'
import { getCacheService } from '../config/redis.js'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

/**
 * Service Maps avec cache intelligent
 */
export class AdvancedMapsService {
  constructor() {
    this.mapsService = getMapsService()
    this.cacheService = null
    
    // Initialiser le cache si disponible
    try {
      this.cacheService = getCacheService()
    } catch (error) {
      logger.warn('Cache Redis non disponible pour Maps Service')
    }
  }

  /**
   * Calcul d'itinéraire optimisé avec cache
   */
  async calculateOptimizedRoute(fromCoords, toCoords, options = {}) {
    try {
      const { lat: fromLat, lng: fromLng } = fromCoords
      const { lat: toLat, lng: toLng } = toCoords
      
      // Vérifier le cache d'abord
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.getRoute(fromLat, fromLng, toLat, toLng)
        if (cached) {
          logger.debug('Route trouvée en cache')
          return {
            ...cached,
            fromCache: true
          }
        }
      }

      // Calculer l'itinéraire via Google Maps
      if (!this.mapsService) {
        throw new Error('Service Google Maps non disponible')
      }

      const routeResult = await this.mapsService.calculateRoute(
        { lat: fromLat, lng: fromLng },
        { lat: toLat, lng: toLng },
        {
          language: options.language || 'fr',
          departureTime: options.departureTime || 'now',
          alternatives: true,
          ...options
        }
      )

      if (!routeResult.success) {
        throw new Error(routeResult.error || 'Erreur calcul itinéraire')
      }

      // Enrichir les données avec des informations supplémentaires
      const enrichedResult = {
        ...routeResult,
        estimatedCost: await this.estimateRouteCost(routeResult.distance, options),
        trafficLevel: this.analyzeTrafficLevel(routeResult),
        serviceAreaValidation: this.validateServiceArea(fromCoords, toCoords),
        calculatedAt: new Date().toISOString(),
        fromCache: false
      }

      // Mettre en cache pour les prochaines requêtes
      if (this.cacheService) {
        await this.cacheService.cacheRoute(fromLat, fromLng, toLat, toLng, enrichedResult)
      }

      logger.info('Route calculée avec succès', {
        distance: enrichedResult.distance,
        duration: enrichedResult.duration,
        estimatedCost: enrichedResult.estimatedCost.totalPrice
      })

      return enrichedResult

    } catch (error) {
      logger.error('Erreur calcul route optimisée', { error: error.message })
      throw error
    }
  }

  /**
   * Géocodage intelligent avec validation
   */
  async geocodeAddressAdvanced(address, options = {}) {
    try {
      if (!address || typeof address !== 'string') {
        throw new Error('Adresse invalide')
      }

      const cleanAddress = this.cleanAddress(address)
      
      // Vérifier le cache
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.get('geocoding', cleanAddress, options.language)
        if (cached) {
          logger.debug('Géocodage trouvé en cache')
          return { ...cached, fromCache: true }
        }
      }

      // Géocodage via Google Maps
      if (!this.mapsService) {
        throw new Error('Service Google Maps non disponible')
      }

      const geocodeResult = await this.mapsService.geocodeAddress(cleanAddress, options.language || 'fr')
      
      if (!geocodeResult.success) {
        // Essayer avec une adresse simplifiée
        const simplifiedAddress = this.simplifyAddress(address)
        if (simplifiedAddress !== cleanAddress) {
          const retryResult = await this.mapsService.geocodeAddress(simplifiedAddress, options.language || 'fr')
          if (retryResult.success) {
            geocodeResult = retryResult
          }
        }
      }

      if (!geocodeResult.success) {
        throw new Error(geocodeResult.error || 'Adresse non trouvée')
      }

      // Validation zone de service
      const inServiceArea = this.mapsService.isInServiceArea(geocodeResult.coordinates)
      
      const enrichedResult = {
        ...geocodeResult,
        inServiceArea,
        confidence: this.calculateConfidence(geocodeResult),
        suggestions: inServiceArea ? null : await this.getNearbyServiceAreas(geocodeResult.coordinates),
        fromCache: false
      }

      // Mettre en cache
      if (this.cacheService) {
        await this.cacheService.set('geocoding', cleanAddress, enrichedResult, 86400, options.language)
      }

      logger.info('Adresse géocodée avec succès', {
        address: enrichedResult.address,
        inServiceArea,
        confidence: enrichedResult.confidence
      })

      return enrichedResult

    } catch (error) {
      logger.error('Erreur géocodage avancé', { error: error.message, address })
      throw error
    }
  }

  /**
   * Suggestions d'adresses avec filtrage intelligent
   */
  async getAddressSuggestions(input, options = {}) {
    try {
      if (!input || input.length < 3) {
        return { success: false, error: 'Saisie trop courte' }
      }

      const cleanInput = input.trim()
      
      // Vérifier le cache
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.get('suggestions', cleanInput, options.language)
        if (cached) {
          logger.debug('Suggestions trouvées en cache')
          return { ...cached, fromCache: true }
        }
      }

      // Obtenir les suggestions via Google Maps
      if (!this.mapsService) {
        throw new Error('Service Google Maps non disponible')
      }

      const suggestionsResult = await this.mapsService.placeAutocomplete(cleanInput, options.language || 'fr')
      
      if (!suggestionsResult.success) {
        throw new Error(suggestionsResult.error || 'Aucune suggestion trouvée')
      }

      // Filtrer et enrichir les suggestions
      const filteredSuggestions = suggestionsResult.predictions
        .filter(prediction => this.isRelevantSuggestion(prediction))
        .slice(0, 5) // Limiter à 5 suggestions
        .map(prediction => ({
          description: prediction.description,
          mainText: prediction.structuredFormatting.main_text,
          secondaryText: prediction.structuredFormatting.secondary_text,
          placeId: prediction.placeId,
          types: prediction.types,
          relevance: this.calculateRelevance(prediction, cleanInput)
        }))
        .sort((a, b) => b.relevance - a.relevance)

      const result = {
        success: true,
        suggestions: filteredSuggestions,
        count: filteredSuggestions.length,
        fromCache: false
      }

      // Mettre en cache
      if (this.cacheService) {
        await this.cacheService.set('suggestions', cleanInput, result, 1800, options.language) // 30 min cache
      }

      logger.debug('Suggestions générées', { input: cleanInput, count: result.count })
      
      return result

    } catch (error) {
      logger.error('Erreur suggestions adresses', { error: error.message, input })
      return { success: false, error: error.message }
    }
  }

  /**
   * Estimation du coût du trajet
   */
  async estimateRouteCost(distance, options = {}) {
    try {
      // Tarifs Bordeaux 2025
      const rates = {
        baseFare: parseFloat(process.env.PRICING_BASE_FARE) || 2.80,
        dayRate: parseFloat(process.env.PRICING_DAY_RATE) || 2.12,
        nightRate: parseFloat(process.env.PRICING_NIGHT_RATE) || 3.18,
        luggageSupplement: parseFloat(process.env.PRICING_LUGGAGE_SUPPLEMENT) || 2.00,
        fifthPassenger: parseFloat(process.env.PRICING_FIFTH_PASSENGER) || 4.00
      }

      const passengers = options.passengers || 1
      const luggage = options.luggage || 0
      const isNight = this.isNightTime(options.departureTime)
      
      const kmRate = isNight ? rates.nightRate : rates.dayRate
      const kmCost = distance * kmRate
      
      let supplements = 0
      if (luggage > 3) {
        supplements += (luggage - 3) * rates.luggageSupplement
      }
      if (passengers > 4) {
        supplements += (passengers - 4) * rates.fifthPassenger
      }
      
      const totalPrice = rates.baseFare + kmCost + supplements
      
      return {
        baseFare: rates.baseFare,
        kmCost: kmCost,
        supplements: supplements,
        totalPrice: Math.round(totalPrice * 100) / 100,
        currency: 'EUR',
        breakdown: {
          baseFare: rates.baseFare,
          kmRate: kmRate,
          distance: distance,
          passengers: passengers,
          luggage: luggage,
          isNightRate: isNight
        }
      }

    } catch (error) {
      logger.error('Erreur estimation coût', { error: error.message, distance })
      return {
        totalPrice: 0,
        error: error.message
      }
    }
  }

  /**
   * Nettoyage et normalisation des adresses
   */
  cleanAddress(address) {
    return address
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[,;]{2,}/g, ',')
      .toLowerCase()
  }

  /**
   * Simplification d'adresse pour retry
   */
  simplifyAddress(address) {
    return address
      .replace(/\b(rue|avenue|boulevard|place|cours|quai|allée|impasse)\b/gi, '')
      .replace(/\d+\s*bis\s*ter/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Calcul du niveau de confiance du géocodage
   */
  calculateConfidence(geocodeResult) {
    let confidence = 0.5 // Base
    
    if (geocodeResult.locationType === 'ROOFTOP') confidence += 0.4
    else if (geocodeResult.locationType === 'RANGE_INTERPOLATED') confidence += 0.3
    else if (geocodeResult.locationType === 'GEOMETRIC_CENTER') confidence += 0.2
    
    if (!geocodeResult.partialMatch) confidence += 0.1
    
    if (geocodeResult.types.includes('street_address')) confidence += 0.2
    else if (geocodeResult.types.includes('route')) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  /**
   * Filtrage des suggestions pertinentes
   */
  isRelevantSuggestion(prediction) {
    const relevantTypes = [
      'street_address',
      'route',
      'locality',
      'sublocality',
      'postal_code',
      'point_of_interest',
      'establishment'
    ]
    
    return prediction.types.some(type => relevantTypes.includes(type))
  }

  /**
   * Calcul de pertinence d'une suggestion
   */
  calculateRelevance(prediction, input) {
    let relevance = 0.5
    
    const mainText = prediction.structuredFormatting.main_text.toLowerCase()
    const inputLower = input.toLowerCase()
    
    if (mainText.startsWith(inputLower)) relevance += 0.3
    else if (mainText.includes(inputLower)) relevance += 0.2
    
    if (prediction.types.includes('street_address')) relevance += 0.2
    if (prediction.description.toLowerCase().includes('bordeaux')) relevance += 0.1
    
    return relevance
  }

  /**
   * Analyse du niveau de trafic
   */
  analyzeTrafficLevel(routeResult) {
    if (!routeResult.durationInTraffic || !routeResult.duration) {
      return 'unknown'
    }
    
    const ratio = routeResult.durationInTraffic / routeResult.duration
    
    if (ratio < 1.1) return 'light'
    if (ratio < 1.3) return 'moderate'
    if (ratio < 1.5) return 'heavy'
    return 'very_heavy'
  }

  /**
   * Validation de la zone de service
   */
  validateServiceArea(fromCoords, toCoords) {
    if (!this.mapsService) return { valid: false, reason: 'Service indisponible' }
    
    const fromInArea = this.mapsService.isInServiceArea(fromCoords)
    const toInArea = this.mapsService.isInServiceArea(toCoords)
    
    if (!fromInArea && !toInArea) {
      return { 
        valid: false, 
        reason: 'Départ et destination hors zone de service'
      }
    }
    
    if (!fromInArea) {
      return { 
        valid: false, 
        reason: 'Départ hors zone de service'
      }
    }
    
    if (!toInArea) {
      return { 
        valid: true, 
        warning: 'Destination hors zone de service (supplément possible)'
      }
    }
    
    return { valid: true }
  }

  /**
   * Trouver des zones de service proches
   */
  async getNearbyServiceAreas(coordinates) {
    try {
      if (!this.mapsService) return []
      
      const nearby = await this.mapsService.nearbySearch(
        coordinates,
        10000,
        'locality',
        'fr'
      )
      
      if (nearby.success) {
        return nearby.places
          .filter(place => this.mapsService.isInServiceArea(place.coordinates))
          .slice(0, 3)
      }
      
      return []
    } catch (error) {
      logger.error('Erreur recherche zones service', { error: error.message })
      return []
    }
  }

  /**
   * Vérifier si c'est l'heure de tarif nuit
   */
  isNightTime(departureTime) {
    const now = departureTime ? new Date(departureTime) : new Date()
    const hours = now.getHours()
    
    const nightStart = parseInt(process.env.NIGHT_RATE_START?.split(':')[0]) || 21
    const nightEnd = parseInt(process.env.NIGHT_RATE_END?.split(':')[0]) || 7
    
    return hours >= nightStart || hours < nightEnd
  }

  /**
   * Statistiques du service Maps
   */
  getServiceStats() {
    const mapsStats = this.mapsService?.getUsageStats() || {}
    
    return {
      googleMapsAvailable: !!this.mapsService,
      cacheAvailable: !!this.cacheService,
      ...mapsStats,
      timestamp: new Date().toISOString()
    }
  }
}

// Instance globale
let advancedMapsService = null

export const getAdvancedMapsService = () => {
  if (!advancedMapsService) {
    advancedMapsService = new AdvancedMapsService()
  }
  return advancedMapsService
}

export default { AdvancedMapsService, getAdvancedMapsService }