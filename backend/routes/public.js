/**
 * ROUTES API PUBLIQUES
 * Endpoints publics (sans authentification)
 */

import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'

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
      phone: '06 67 23 78 22',
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
    baseFare: parseFloat(process.env.PRICING_BASE_FARE) || 2.80,
    dayRate: parseFloat(process.env.PRICING_DAY_RATE) || 2.12,
    nightRate: parseFloat(process.env.PRICING_NIGHT_RATE) || 3.18,
    nightStart: process.env.NIGHT_RATE_START || '21:00',
    nightEnd: process.env.NIGHT_RATE_END || '07:00',
    minimumFare: 7.30,
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

export default router