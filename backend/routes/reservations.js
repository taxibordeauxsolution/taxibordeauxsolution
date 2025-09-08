/**
 * ROUTES API RÉSERVATIONS
 * Endpoints complets avec validation multilingue
 */

import express from 'express'
import Joi from 'joi'
import Reservation from '../models/Reservation.js'
import { getAdvancedMapsService } from '../services/mapsService.js'
import { getEmailService } from '../config/email.js'
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

// Schéma de validation pour une nouvelle réservation
const createReservationSchema = Joi.object({
  // Trajet
  trip: Joi.object({
    from: Joi.object({
      address: Joi.string().required().max(500).messages({
        'string.empty': 'Adresse de départ requise',
        'string.max': 'Adresse de départ trop longue'
      }),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).required()
    }).required(),
    to: Joi.object({
      address: Joi.string().required().max(500).messages({
        'string.empty': 'Adresse de destination requise',
        'string.max': 'Adresse de destination trop longue'
      }),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).required()
    }).required()
  }).required(),

  // Détails de réservation
  booking: Joi.object({
    passengers: Joi.number().integer().min(1).max(8).default(1),
    luggage: Joi.number().integer().min(0).max(10).default(0),
    isImmediate: Joi.boolean().default(true),
    scheduledDateTime: Joi.when('isImmediate', {
      is: false,
      then: Joi.date().min('now').required().messages({
        'date.min': 'La date ne peut pas être dans le passé'
      }),
      otherwise: Joi.date().optional()
    }),
    notes: Joi.string().max(1000).allow('').default(''),
    preferredLanguage: Joi.string().valid('fr', 'en', 'es').default('fr'),
    specialRequests: Joi.object({
      childSeat: Joi.boolean().default(false),
      wheelchair: Joi.boolean().default(false),
      animal: Joi.boolean().default(false),
      smoking: Joi.boolean().default(false),
      airConditioning: Joi.boolean().default(true)
    }).optional()
  }).required(),

  // Informations client
  customer: Joi.object({
    name: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Nom requis',
      'string.min': 'Nom trop court',
      'string.max': 'Nom trop long'
    }),
    phone: Joi.string().required().pattern(/^(?:\+33|0)[1-9](?:[0-9]{8})$/).messages({
      'string.pattern.base': 'Numéro de téléphone invalide'
    }),
    email: Joi.string().email().optional().allow('').messages({
      'string.email': 'Adresse email invalide'
    })
  }).required(),

  // Métadonnées
  metadata: Joi.object({
    source: Joi.string().valid('web', 'mobile', 'api', 'phone', 'admin').default('web'),
    userAgent: Joi.string().optional(),
    referrer: Joi.string().optional(),
    sessionId: Joi.string().optional()
  }).optional()
})

// Schéma pour mise à jour du statut
const updateStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending', 'confirmed', 'assigned', 'driver_arrived', 
    'in_progress', 'completed', 'cancelled', 'refunded'
  ).required(),
  reason: Joi.string().max(500).optional(),
  metadata: Joi.object().optional()
})

// Schéma pour recherche par téléphone
const phoneSearchSchema = Joi.object({
  phone: Joi.string().required().pattern(/^(?:\+33|0)[1-9](?:[0-9]{8})$/),
  limit: Joi.number().integer().min(1).max(50).default(10)
})

/**
 * POST /api/reservations - Créer une nouvelle réservation
 */
router.post('/', validationMiddleware(createReservationSchema), async (req, res) => {
  try {
    const { trip, booking, customer, metadata = {} } = req.body
    const language = req.language || booking.preferredLanguage || 'fr'

    logger.info('Nouvelle demande de réservation', {
      from: trip.from.address,
      to: trip.to.address,
      customer: customer.phone,
      language: language
    })

    // 1. Calculer l'itinéraire et le prix via Google Maps
    const mapsService = getAdvancedMapsService()
    if (!mapsService) {
      return res.status(503).json({
        error: 'Service cartographique temporairement indisponible',
        code: 'MAPS_SERVICE_UNAVAILABLE'
      })
    }

    let routeResult = null
    try {
      routeResult = await mapsService.calculateOptimizedRoute(
        trip.from.coordinates,
        trip.to.coordinates,
        {
          language: language,
          passengers: booking.passengers,
          luggage: booking.luggage,
          departureTime: booking.scheduledDateTime || 'now'
        }
      )
    } catch (error) {
      logger.warn('Google Maps API indisponible, création de réservation en mode dégradé', { error: error.message })
    }

    // Mode dégradé si Google Maps ne fonctionne pas
    if (!routeResult || !routeResult.success) {
      logger.info('Création réservation en mode dégradé sans calcul d\'itinéraire')
      routeResult = {
        success: true,
        distance: 10, // Distance estimée par défaut
        duration: 20, // Durée estimée par défaut
        price: 25.00, // Prix estimé par défaut
        serviceAreaValidation: { valid: true }, // Accepter toutes les zones en mode dégradé
        estimatedCost: {
          totalPrice: 25.00,
          currency: 'EUR',
          baseFare: 2.80,
          kmCost: 22.20,
          supplements: 0,
          breakdown: {
            baseFare: 2.80,
            kmRate: 2.12,
            distance: 10,
            passengers: booking.passengers,
            luggage: booking.luggage,
            isNightRate: false
          }
        },
        polyline: null,
        fromCache: false,
        degradedMode: true
      }
    }

    // 2. Validation zone de service (skip en mode dégradé)
    if (!routeResult.degradedMode && !routeResult.serviceAreaValidation.valid) {
      return res.status(400).json({
        error: routeResult.serviceAreaValidation.reason || 'Trajet hors zone de service',
        code: 'OUT_OF_SERVICE_AREA'
      })
    }

    // 3. Créer la réservation
    const reservationData = {
      trip: {
        from: {
          address: trip.from.address,
          coordinates: trip.from.coordinates
        },
        to: {
          address: trip.to.address,
          coordinates: trip.to.coordinates
        },
        distance: routeResult.distance,
        duration: routeResult.duration,
        routeData: {
          overview_polyline: routeResult.polyline,
          bounds: routeResult.bounds,
          steps: routeResult.steps
        },
        estimatedPrice: routeResult.estimatedCost.totalPrice
      },
      booking: {
        ...booking,
        detectedLanguage: language
      },
      customer: {
        ...customer,
        languagePreference: language,
        ipAddress: req.ip
      },
      pricing: {
        basePrice: routeResult.estimatedCost.baseFare,
        kmPrice: routeResult.estimatedCost.kmCost,
        luggageSupplement: routeResult.estimatedCost.supplements,
        totalPrice: routeResult.estimatedCost.totalPrice,
        currency: 'EUR',
        locale: language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR',
        calculationDetails: routeResult.estimatedCost.breakdown
      },
      metadata: {
        source: metadata.source || 'web',
        userAgent: req.get('User-Agent'),
        ...metadata
      }
    }

    const reservation = new Reservation(reservationData)
    await reservation.save()

    logger.info('Réservation créée avec succès', {
      reservationId: reservation.reservationId,
      totalPrice: reservation.pricing.totalPrice,
      customer: customer.phone
    })

    // 4. Envoi email de confirmation (si email fourni)
    if (customer.email) {
      try {
        const emailService = getEmailService()
        if (emailService) {
          await emailService.sendReservationConfirmation(reservation, language)
          logger.info('Email de confirmation envoyé', { 
            reservationId: reservation.reservationId,
            email: customer.email 
          })
        }
      } catch (emailError) {
        logger.error('Erreur envoi email confirmation', {
          error: emailError.message,
          reservationId: reservation.reservationId
        })
        // Ne pas faire échouer la réservation si l'email échoue
      }
    }

    // 5. Réponse avec toutes les informations
    res.status(201).json({
      success: true,
      message: language === 'en' ? 'Booking created successfully' :
               language === 'es' ? 'Reserva creada con éxito' :
               'Réservation créée avec succès',
      reservation: {
        id: reservation._id,
        reservationId: reservation.reservationId,
        status: reservation.status,
        trip: reservation.trip,
        booking: reservation.booking,
        customer: {
          name: reservation.customer.name,
          phone: reservation.customer.phone,
          email: reservation.customer.email
        },
        pricing: reservation.pricing,
        estimatedPickupTime: `${process.env.DEFAULT_PICKUP_TIME || 8} minutes`,
        createdAt: reservation.createdAt
      },
      next_steps: language === 'en' ? [
        'You will receive an SMS confirmation',
        'A driver will be assigned within 5-10 minutes',
        'Track your booking status online'
      ] : language === 'es' ? [
        'Recibirá una confirmación por SMS',
        'Se asignará un conductor en 5-10 minutos',
        'Siga el estado de su reserva online'
      ] : [
        'Vous recevrez une confirmation SMS',
        'Un chauffeur sera assigné dans 5-10 minutes',
        'Suivez le statut de votre réservation en ligne'
      ]
    })

  } catch (error) {
    logger.error('Erreur création réservation', {
      error: error.message,
      stack: error.stack,
      body: req.body
    })

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Données invalides',
        details: Object.values(error.errors).map(err => err.message),
        code: 'VALIDATION_ERROR'
      })
    }

    res.status(500).json({
      error: 'Erreur serveur lors de la création de la réservation',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * GET /api/reservations/:id - Consulter une réservation
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Recherche par ID ou reservationId
    const reservation = await Reservation.findOne({
      $or: [
        { _id: id },
        { reservationId: id }
      ]
    })

    if (!reservation) {
      return res.status(404).json({
        error: 'Réservation non trouvée',
        code: 'RESERVATION_NOT_FOUND'
      })
    }

    res.json({
      success: true,
      reservation: reservation
    })

  } catch (error) {
    logger.error('Erreur consultation réservation', {
      error: error.message,
      id: req.params.id
    })

    res.status(500).json({
      error: 'Erreur consultation réservation',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * PUT /api/reservations/:id/status - Mettre à jour le statut
 */
router.put('/:id/status', validationMiddleware(updateStatusSchema), async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason, metadata = {} } = req.body

    const reservation = await Reservation.findOne({
      $or: [
        { _id: id },
        { reservationId: id }
      ]
    })

    if (!reservation) {
      return res.status(404).json({
        error: 'Réservation non trouvée',
        code: 'RESERVATION_NOT_FOUND'
      })
    }

    const oldStatus = reservation.status
    await reservation.updateStatus(status, reason || `Statut modifié de ${oldStatus} vers ${status}`, metadata)

    logger.info('Statut réservation mis à jour', {
      reservationId: reservation.reservationId,
      oldStatus: oldStatus,
      newStatus: status,
      reason: reason
    })

    res.json({
      success: true,
      message: `Statut mis à jour vers ${status}`,
      reservation: {
        id: reservation._id,
        reservationId: reservation.reservationId,
        status: reservation.status,
        updatedAt: reservation.updatedAt
      }
    })

  } catch (error) {
    logger.error('Erreur mise à jour statut', {
      error: error.message,
      id: req.params.id
    })

    res.status(500).json({
      error: 'Erreur mise à jour statut',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * GET /api/reservations/customer/:phone - Historique client
 */
router.get('/customer/:phone', async (req, res) => {
  try {
    const { phone } = req.params
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    // Validation du numéro de téléphone
    const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide',
        code: 'INVALID_PHONE_NUMBER'
      })
    }

    const reservations = await Reservation.find({ 'customer.phone': phone })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select('-events -communications') // Exclure les données volumineuses

    const total = await Reservation.countDocuments({ 'customer.phone': phone })

    res.json({
      success: true,
      reservations: reservations,
      pagination: {
        total: total,
        count: reservations.length,
        limit: limit,
        offset: offset,
        hasMore: (offset + limit) < total
      }
    })

  } catch (error) {
    logger.error('Erreur historique client', {
      error: error.message,
      phone: req.params.phone
    })

    res.status(500).json({
      error: 'Erreur récupération historique',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * DELETE /api/reservations/:id - Annuler une réservation
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { reason = 'Annulation client' } = req.body

    const reservation = await Reservation.findOne({
      $or: [
        { _id: id },
        { reservationId: id }
      ]
    })

    if (!reservation) {
      return res.status(404).json({
        error: 'Réservation non trouvée',
        code: 'RESERVATION_NOT_FOUND'
      })
    }

    // Vérifier si annulation possible
    if (['completed', 'cancelled', 'refunded'].includes(reservation.status)) {
      return res.status(400).json({
        error: 'Cette réservation ne peut plus être annulée',
        code: 'CANCELLATION_NOT_ALLOWED'
      })
    }

    await reservation.updateStatus('cancelled', reason, {
      cancelledBy: 'customer',
      cancelledAt: new Date()
    })

    // Envoi email d'annulation si email disponible
    if (reservation.customer.email) {
      try {
        const emailService = getEmailService()
        if (emailService) {
          await emailService.sendCancellation(
            reservation,
            reason,
            reservation.customer.languagePreference || 'fr'
          )
        }
      } catch (emailError) {
        logger.error('Erreur envoi email annulation', {
          error: emailError.message,
          reservationId: reservation.reservationId
        })
      }
    }

    logger.info('Réservation annulée', {
      reservationId: reservation.reservationId,
      reason: reason
    })

    res.json({
      success: true,
      message: 'Réservation annulée avec succès',
      reservation: {
        id: reservation._id,
        reservationId: reservation.reservationId,
        status: reservation.status,
        cancelledAt: new Date()
      }
    })

  } catch (error) {
    logger.error('Erreur annulation réservation', {
      error: error.message,
      id: req.params.id
    })

    res.status(500).json({
      error: 'Erreur annulation réservation',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

/**
 * GET /api/reservations - Liste des réservations (avec filtres)
 */
router.get('/', async (req, res) => {
  try {
    const {
      status,
      date_from,
      date_to,
      customer_phone,
      driver_id,
      limit = 20,
      offset = 0,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query

    // Construction du filtre
    const filter = {}
    
    if (status) {
      filter.status = status
    }
    
    if (date_from || date_to) {
      filter.createdAt = {}
      if (date_from) filter.createdAt.$gte = new Date(date_from)
      if (date_to) filter.createdAt.$lte = new Date(date_to)
    }
    
    if (customer_phone) {
      filter['customer.phone'] = customer_phone
    }
    
    if (driver_id) {
      filter['driver.driverId'] = driver_id
    }

    // Tri
    const sortOptions = {}
    sortOptions[sort_by] = sort_order === 'asc' ? 1 : -1

    const reservations = await Reservation.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-events -communications') // Optimisation

    const total = await Reservation.countDocuments(filter)

    res.json({
      success: true,
      reservations: reservations,
      pagination: {
        total: total,
        count: reservations.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      },
      filter: filter
    })

  } catch (error) {
    logger.error('Erreur liste réservations', {
      error: error.message,
      query: req.query
    })

    res.status(500).json({
      error: 'Erreur récupération réservations',
      code: 'INTERNAL_SERVER_ERROR'
    })
  }
})

export default router