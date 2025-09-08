/**
 * ROUTES API GOOGLE MAPS
 * Services cartographiques complets avec cache Redis
 */

import express from 'express'
import Joi from 'joi'
import { getAdvancedMapsService } from '../services/mapsService.js'
import { validationMiddleware } from '../middleware/validation.js'
import winston from 'winston'

const router = express.Router()
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

/**
 * SCHÉMAS DE VALIDATION JOI
 */

// Schéma pour calcul d'itinéraire
const calculateRouteSchema = Joi.object({
  from: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }).required(),
  to: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }).required(),
  options: Joi.object({
    language: Joi.string().valid('fr', 'en', 'es').default('fr'),
    passengers: Joi.number().integer().min(1).max(8).default(1),
    luggage: Joi.number().integer().min(0).max(10).default(0),
    departureTime: Joi.alternatives().try(
      Joi.date(),
      Joi.string().valid('now')
    ).default('now'),
    alternatives: Joi.boolean().default(false),
    avoid: Joi.array().items(
      Joi.string().valid('tolls', 'highways', 'ferries', 'indoor')
    ).default([])
  }).default({})
})

// Schéma pour géocodage
const geocodeSchema = Joi.object({
  address: Joi.string().required().min(3).max(500),
  language: Joi.string().valid('fr', 'en', 'es').default('fr')
})

// Schéma pour géocodage inverse
const reverseGeocodeSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  language: Joi.string().valid('fr', 'en', 'es').default('fr')
})

// Schéma pour suggestions d'adresses
const autocompleteSchema = Joi.object({
  input: Joi.string().required().min(2).max(200),
  language: Joi.string().valid('fr', 'en', 'es').default('fr')
})

// Schéma pour matrice de distances
const distanceMatrixSchema = Joi.object({
  origins: Joi.array().items(
    Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    })
  ).min(1).max(10).required(),
  destinations: Joi.array().items(
    Joi.object({
      lat: Joi.number().min(-90).max(90).required(),
      lng: Joi.number().min(-180).max(180).required()
    })
  ).min(1).max(10).required(),
  options: Joi.object({
    language: Joi.string().valid('fr', 'en', 'es').default('fr'),
    departureTime: Joi.alternatives().try(
      Joi.date(),
      Joi.string().valid('now')
    ).default('now')
  }).default({})
})

/**
 * POST /api/maps/calculate-route - Calcul d'itinéraire précis
 */
router.post('/calculate-route', validationMiddleware(calculateRouteSchema), async (req, res) => {
  try {
    const { from, to, options = {} } = req.body
    const language = req.language || options.language || 'fr'

    logger.debug('Calcul d\'itinéraire demandé', {
      from: `${from.lat},${from.lng}`,
      to: `${to.lat},${to.lng}`,
      language: language
    })

    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: language === 'en' ? 'Maps service temporarily unavailable' :
               language === 'es' ? 'Servicio de mapas temporalmente no disponible' :
               'Service cartographique temporairement indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const result = await mapsService.calculateOptimizedRoute(from, to, {
      ...options,
      language: language
    })

    if (!result.success) {
      return res.status(400).json({
        error: language === 'en' ? 'Unable to calculate route' :
               language === 'es' ? 'No se puede calcular la ruta' :
               'Impossible de calculer l\'itinéraire',
        details: result.error,
        code: 'ROUTE_CALCULATION_FAILED'
      })
    }

    res.json({
      success: true,
      route: {
        distance: result.distance,
        duration: result.duration,
        durationInTraffic: result.durationInTraffic,
        startAddress: result.startAddress,
        endAddress: result.endAddress,
        polyline: result.polyline,
        bounds: result.bounds,
        steps: result.steps,
        alternatives: result.alternatives,
        warnings: result.warnings || [],
        estimatedCost: result.estimatedCost,
        trafficLevel: result.trafficLevel,
        serviceAreaValidation: result.serviceAreaValidation
      },
      metadata: {
        fromCache: result.fromCache,
        calculatedAt: result.calculatedAt || new Date().toISOString(),
        language: language
      }
    })

  } catch (error) {
    logger.error('Erreur calcul itinéraire', {
      error: error.message,
      body: req.body
    })

    res.status(500).json({
      error: 'Erreur serveur lors du calcul d\'itinéraire',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * POST /api/maps/geocode - Géocodage d'adresses
 */
router.post('/geocode', validationMiddleware(geocodeSchema), async (req, res) => {
  try {
    const { address, language = 'fr' } = req.body

    logger.debug('Géocodage demandé', { address, language })

    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const result = await mapsService.geocodeAddressAdvanced(address, {
      language: language
    })

    if (!result.success) {
      return res.status(404).json({
        error: language === 'en' ? 'Address not found' :
               language === 'es' ? 'Dirección no encontrada' :
               'Adresse non trouvée',
        details: result.error,
        code: 'ADDRESS_NOT_FOUND'
      })
    }

    res.json({
      success: true,
      geocoding: {
        address: result.address,
        coordinates: result.coordinates,
        placeId: result.placeId,
        types: result.types,
        components: result.components,
        inServiceArea: result.inServiceArea,
        confidence: result.confidence,
        suggestions: result.suggestions
      },
      metadata: {
        fromCache: result.fromCache,
        language: language
      }
    })

  } catch (error) {
    logger.error('Erreur géocodage', {
      error: error.message,
      address: req.body.address
    })

    res.status(500).json({
      error: 'Erreur serveur lors du géocodage',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * POST /api/maps/reverse-geocode - Géocodage inverse
 */
router.post('/reverse-geocode', validationMiddleware(reverseGeocodeSchema), async (req, res) => {
  try {
    const { lat, lng, language = 'fr' } = req.body

    logger.debug('Géocodage inverse demandé', { lat, lng, language })

    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const googleMaps = mapsService.mapsService
    if (!googleMaps) {
      return res.status(503).json({
        error: 'Service Google Maps indisponible',
        code: 'GOOGLE_MAPS_UNAVAILABLE'
      })
    }

    const result = await googleMaps.reverseGeocode(lat, lng, language)

    if (!result.success) {
      return res.status(404).json({
        error: language === 'en' ? 'Coordinates not resolved' :
               language === 'es' ? 'Coordenadas no resueltas' :
               'Coordonnées non résolues',
        details: result.error,
        code: 'COORDINATES_NOT_RESOLVED'
      })
    }

    res.json({
      success: true,
      reverseGeocoding: {
        address: result.address,
        coordinates: result.coordinates,
        placeId: result.placeId,
        types: result.types,
        components: result.components
      },
      metadata: {
        language: language
      }
    })

  } catch (error) {
    logger.error('Erreur géocodage inverse', {
      error: error.message,
      coordinates: { lat: req.body.lat, lng: req.body.lng }
    })

    res.status(500).json({
      error: 'Erreur serveur lors du géocodage inverse',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * GET /api/maps/places/autocomplete - Suggestions d'adresses
 */
router.get('/places/autocomplete', async (req, res) => {
  try {
    const { input, language = 'fr' } = req.query

    // Validation manuelle pour GET
    if (!input || typeof input !== 'string' || input.length < 2) {
      return res.status(400).json({
        error: 'Paramètre input requis (minimum 2 caractères)',
        code: 'INVALID_INPUT'
      })
    }

    logger.debug('Autocomplete demandé', { input, language })

    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const result = await mapsService.getAddressSuggestions(input, {
      language: language
    })

    if (!result.success) {
      return res.status(404).json({
        error: language === 'en' ? 'No suggestions found' :
               language === 'es' ? 'No se encontraron sugerencias' :
               'Aucune suggestion trouvée',
        details: result.error,
        code: 'NO_SUGGESTIONS_FOUND'
      })
    }

    res.json({
      success: true,
      suggestions: result.suggestions,
      count: result.count,
      metadata: {
        fromCache: result.fromCache,
        language: language,
        input: input
      }
    })

  } catch (error) {
    logger.error('Erreur autocomplete', {
      error: error.message,
      input: req.query.input
    })

    res.status(500).json({
      error: 'Erreur serveur lors de l\'autocomplete',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * POST /api/maps/distance-matrix - Matrice de distances multiples
 */
router.post('/distance-matrix', validationMiddleware(distanceMatrixSchema), async (req, res) => {
  try {
    const { origins, destinations, options = {} } = req.body
    const language = req.language || options.language || 'fr'

    logger.debug('Distance matrix demandée', {
      origins: origins.length,
      destinations: destinations.length,
      language: language
    })

    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const googleMaps = mapsService.mapsService
    if (!googleMaps) {
      return res.status(503).json({
        error: 'Service Google Maps indisponible',
        code: 'GOOGLE_MAPS_UNAVAILABLE'
      })
    }

    // Convertir les coordonnées en strings pour Google Maps
    const originsStrings = origins.map(coord => `${coord.lat},${coord.lng}`)
    const destinationsStrings = destinations.map(coord => `${coord.lat},${coord.lng}`)

    const result = await googleMaps.distanceMatrix(
      originsStrings,
      destinationsStrings,
      {
        ...options,
        language: language
      }
    )

    if (!result.success) {
      return res.status(400).json({
        error: language === 'en' ? 'Unable to calculate distance matrix' :
               language === 'es' ? 'No se puede calcular la matriz de distancias' :
               'Impossible de calculer la matrice de distances',
        details: result.error,
        code: 'DISTANCE_MATRIX_FAILED'
      })
    }

    res.json({
      success: true,
      distanceMatrix: {
        rows: result.rows
      },
      metadata: {
        language: language,
        origins: origins.length,
        destinations: destinations.length
      }
    })

  } catch (error) {
    logger.error('Erreur distance matrix', {
      error: error.message,
      body: req.body
    })

    res.status(500).json({
      error: 'Erreur serveur lors du calcul de matrice',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * GET /api/maps/service-area - Validation zone de service
 */
router.get('/service-area', async (req, res) => {
  try {
    const { lat, lng } = req.query
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Paramètres lat et lng requis',
        code: 'MISSING_COORDINATES'
      })
    }

    const coordinates = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }

    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const googleMaps = mapsService.mapsService
    const inServiceArea = googleMaps ? googleMaps.isInServiceArea(coordinates) : false

    res.json({
      success: true,
      serviceArea: {
        coordinates: coordinates,
        inServiceArea: inServiceArea,
        bounds: {
          northeast: { lat: 44.95, lng: -0.4 },
          southwest: { lat: 44.7, lng: -0.8 }
        }
      }
    })

  } catch (error) {
    logger.error('Erreur validation zone service', {
      error: error.message,
      coordinates: { lat: req.query.lat, lng: req.query.lng }
    })

    res.status(500).json({
      error: 'Erreur validation zone de service',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * GET /api/maps/stats - Statistiques utilisation
 */
router.get('/stats', async (req, res) => {
  try {
    const mapsService = getAdvancedMapsService()
    
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const stats = mapsService.getServiceStats()

    res.json({
      success: true,
      stats: stats
    })

  } catch (error) {
    logger.error('Erreur récupération stats maps', {
      error: error.message
    })

    res.status(500).json({
      error: 'Erreur récupération statistiques',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * POST /api/maps/estimate-pricing - Estimation prix rapide
 */
router.post('/estimate-pricing', async (req, res) => {
  try {
    const { distance, passengers = 1, luggage = 0, departureTime = 'now' } = req.body

    if (!distance || distance <= 0) {
      return res.status(400).json({
        error: 'Distance requise et doit être positive',
        code: 'INVALID_DISTANCE'
      })
    }

    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    const pricing = await mapsService.estimateRouteCost(distance, {
      passengers: passengers,
      luggage: luggage,
      departureTime: departureTime
    })

    res.json({
      success: true,
      pricing: pricing
    })

  } catch (error) {
    logger.error('Erreur estimation prix', {
      error: error.message,
      body: req.body
    })

    res.status(500).json({
      error: 'Erreur estimation prix',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

export default router