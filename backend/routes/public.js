/**
 * ROUTES API PUBLIQUES
 * Endpoints publics (sans authentification)
 */

import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import ConfigPrix from '../models/ConfigPrix.js'
import Forfait from '../models/Forfait.js'

const router = express.Router()

/**
 * GET /api/public/health
 * Health check public simple
 */
router.get('/health', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Taxi Bordeaux API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}))

/**
 * GET /api/public/config
 * Configuration publique (sans informations sensibles)
 */
router.get('/config', asyncHandler(async (req, res) => {
  const publicConfig = {
    serviceName: 'Taxi Bordeaux Solution',
    supportedLanguages: ['fr', 'en', 'es'],
    serviceArea: {
      center: { lat: 44.8378, lng: -0.5792 },
      radius: 25 // km
    },
    contact: {
      phone: '+33 5 54 54 34 66',
      email: 'contact@taxibordeauxsolution.fr',
      website: 'https://taxibordeauxsolution.fr'
    },
    availability: '24h/24 - 7j/7',
    estimatedPickupTime: '5-10 minutes'
  }
  
  res.json({
    success: true,
    data: publicConfig
  })
}))

/**
 * GET /api/public/pricing
 * Informations tarifaires publiques
 */
router.get('/pricing', asyncHandler(async (req, res) => {
  const pricing = {
    baseFare: parseFloat(process.env.PRICING_BASE_FARE) || 2.83,
    dayRate: parseFloat(process.env.PRICING_DAY_RATE) || 2.16,
    nightRate: parseFloat(process.env.PRICING_NIGHT_RATE) || 3.24,
    nightStart: process.env.NIGHT_RATE_START || '21:00',
    nightEnd: process.env.NIGHT_RATE_END || '07:00',
    minimumFare: 30.00,
    currency: 'EUR',
    supplements: {
      luggage: 'Gratuit jusqu\'à 3 bagages, puis 2.00€/bagage',
      passengers: 'Gratuit jusqu\'à 4 passagers, puis 4.00€/passager supplémentaire'
    }
  }
  
  res.json({
    success: true,
    data: pricing
  })
}))

/**
 * GET /api/public/forfaits
 * Forfaits actifs (utilisé par le module de réservation)
 */
router.get('/forfaits', asyncHandler(async (req, res) => {
  const forfaits = await Forfait.find({ actif: true }).select('-__v')
  res.json({ success: true, data: forfaits })
}))

/**
 * GET /api/public/prix
 * Tarifs de base (utilisé par le module de réservation)
 */
router.get('/prix', asyncHandler(async (req, res) => {
  let config = await ConfigPrix.findOne()
  if (!config) config = await ConfigPrix.create({})
  res.json({ success: true, data: config })
}))

export default router