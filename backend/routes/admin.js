/**
 * ROUTES API ADMINISTRATION
 * Endpoints pour la gestion administrative du système taxi
 */

import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = express.Router()

/**
 * GET /api/admin/health
 * Health check détaillé du système
 */
router.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected', // Sera mis à jour avec la vraie connexion MongoDB
      redis: 'not_configured',
      email: 'configured'
    }
  }
  
  res.json({
    success: true,
    data: health
  })
}))

/**
 * GET /api/admin/stats
 * Statistiques générales du système
 */
router.get('/stats', asyncHandler(async (req, res) => {
  // Pour l'instant, des stats basiques
  // Sera étendu avec de vraies données MongoDB
  const stats = {
    reservations: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0
    },
    revenue: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      total: 0
    },
    popularRoutes: [],
    peakHours: []
  }
  
  res.json({
    success: true,
    data: stats
  })
}))

/**
 * GET /api/admin/config
 * Configuration actuelle du système
 */
router.get('/config', asyncHandler(async (req, res) => {
  const config = {
    pricing: {
      baseFare: parseFloat(process.env.PRICING_BASE_FARE) || 2.80,
      dayRate: parseFloat(process.env.PRICING_DAY_RATE) || 2.12,
      nightRate: parseFloat(process.env.PRICING_NIGHT_RATE) || 3.18,
      nightStart: process.env.NIGHT_RATE_START || '21:00',
      nightEnd: process.env.NIGHT_RATE_END || '07:00'
    },
    serviceArea: {
      latMin: parseFloat(process.env.SERVICE_ZONE_LAT_MIN) || 44.7,
      latMax: parseFloat(process.env.SERVICE_ZONE_LAT_MAX) || 44.95,
      lngMin: parseFloat(process.env.SERVICE_ZONE_LNG_MIN) || -0.8,
      lngMax: parseFloat(process.env.SERVICE_ZONE_LNG_MAX) || -0.4
    },
    languages: ['fr', 'en', 'es']
  }
  
  res.json({
    success: true,
    data: config
  })
}))

export default router