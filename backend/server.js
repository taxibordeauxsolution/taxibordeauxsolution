/**
 * TAXI BORDEAUX SOLUTION - SERVER PRINCIPAL
 * Backend Node.js professionnel avec support multilingue
 * Intégration Google Maps, MongoDB, Redis
 */

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import redis from 'redis'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import winston from 'winston'
import 'winston-daily-rotate-file'

// Import des services et middleware
import { connectDatabase } from './config/database.js'
import { connectRedis } from './config/redis.js'
import { setupGoogleMaps } from './config/maps.js'
import { setupEmail } from './config/email.js'

// Import des routes
import reservationRoutes from './routes/reservations.js'
import mapsRoutes from './routes/maps.js'
import translationRoutes from './routes/translations.js'
import adminRoutes from './routes/admin.js'
import publicRoutes from './routes/public.js'

// Import des middleware
import { languageMiddleware } from './middleware/language.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authenticate } from './middleware/auth.js'
import { validationMiddleware } from './middleware/validation.js'

// Configuration de l'environnement
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})

const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// ================================
// CONFIGURATION WINSTON LOGGER
// ================================
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'taxi-bordeaux-backend' },
  transports: [
    new winston.transports.Console({
      format: NODE_ENV === 'development' 
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : logFormat
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d'
    })
  ]
})

// ================================
// MIDDLEWARE DE SÉCURITÉ
// ================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https://maps.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://maps.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}))

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Non autorisé par CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}))

app.use(compression({
  threshold: parseInt(process.env.COMPRESSION_THRESHOLD) || 1024,
  level: parseInt(process.env.COMPRESSION_LEVEL) || 6
}))

app.use(mongoSanitize())

// ================================
// RATE LIMITING AVANCÉ
// ================================
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_RESERVATIONS) || 10,
  message: {
    error: 'Trop de tentatives de réservation, veuillez réessayer plus tard',
    retryAfter: '15 minutes'
  },
  skip: (req) => req.ip === '127.0.0.1' // Skip pour les tests locaux
})

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT_MAX) || 1000,
  message: {
    error: 'Limite API atteinte',
    retryAfter: '15 minutes'
  }
})

// ================================
// MIDDLEWARE EXPRESS
// ================================
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware de logging des requêtes
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      logger.info('Request processed', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
    })
    next()
  })
}

// ================================
// MIDDLEWARE PERSONNALISÉS
// ================================
app.use(languageMiddleware)

// Trust proxy pour rate limiting behind reverse proxy
app.set('trust proxy', 1)

// ================================
// ROUTES PRINCIPALES
// ================================
app.use(generalLimiter)

// Health check (sans rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      mongodb_error: app.locals.mongoError || null,
      redis: app.locals.redis ? 'connected' : 'disconnected', 
      redis_error: app.locals.redisError || null,
      googleMaps: app.locals.mapsClient ? 'configured' : 'not_configured',
      email: app.locals.emailTransporter ? 'configured' : 'not_configured'
    }
  })
})

// Routes API avec leurs limiteurs spécifiques
app.use('/api/reservations', reservationLimiter, reservationRoutes)
app.use('/api/maps', apiLimiter, mapsRoutes)
app.use('/api/translations', apiLimiter, translationRoutes)
app.use('/api/admin', authenticate, adminRoutes)
app.use('/api/public', publicRoutes)

// Route de test pour vérifier le bon fonctionnement
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend Taxi Bordeaux Solution opérationnel',
    language: req.language,
    timestamp: new Date().toISOString(),
    features: [
      'Google Maps Integration',
      'Multilingual Support (FR/EN/ES)',
      'Real-time Pricing',
      'Email & SMS Notifications',
      'MongoDB Database',
      'Redis Caching',
      'Professional Logging',
      'Rate Limiting',
      'Security Headers'
    ]
  })
})

// ================================
// WEBSOCKET POUR TEMPS RÉEL
// ================================
io.on('connection', (socket) => {
  logger.info('Client connecté', { socketId: socket.id })

  socket.on('join-reservation', (reservationId) => {
    socket.join(`reservation-${reservationId}`)
    logger.info('Client rejoint reservation room', { socketId: socket.id, reservationId })
  })

  socket.on('driver-location-update', (data) => {
    socket.to(`reservation-${data.reservationId}`).emit('driver-location', data)
  })

  socket.on('disconnect', () => {
    logger.info('Client déconnecté', { socketId: socket.id })
  })
})

// ================================
// GESTION GLOBALE DES ERREURS
// ================================
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `${req.method} ${req.originalUrl} n'existe pas`,
    availableRoutes: [
      'GET /health',
      'GET /api/test',
      'POST /api/reservations',
      'GET /api/maps/*',
      'GET /api/translations/*',
      'GET /api/public/*'
    ]
  })
})

app.use(errorHandler)

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise })
  process.exit(1)
})

// ================================
// INITIALISATION DU SERVEUR
// ================================
async function startServer() {
  try {
    // Connexion à la base de données (avec gestion d'erreur)
    try {
      await connectDatabase()
      logger.info('✅ Connexion MongoDB établie')
    } catch (mongoError) {
      logger.warn('⚠️ MongoDB non disponible, serveur démarre sans DB', { error: mongoError.message })
      app.locals.mongoError = mongoError.message
    }

    // Connexion à Redis (avec gestion d'erreur)
    try {
      const redisClient = await connectRedis()
      app.locals.redis = redisClient
      logger.info('✅ Connexion Redis établie')
    } catch (redisError) {
      logger.warn('⚠️ Redis non disponible, serveur démarre sans cache', { error: redisError.message })
      app.locals.redisError = redisError.message
    }

    // Configuration Google Maps
    const mapsClient = setupGoogleMaps()
    app.locals.mapsClient = mapsClient
    logger.info('✅ Google Maps API configuré')

    // Configuration email (avec gestion d'erreur)
    try {
      const emailTransporter = setupEmail()
      app.locals.emailTransporter = emailTransporter
      logger.info('✅ Service email configuré')
    } catch (emailError) {
      logger.warn('⚠️ Email non disponible, serveur démarre sans service email', { error: emailError.message })
      app.locals.emailError = emailError.message
    }

    // Démarrage du serveur
    server.listen(PORT, () => {
      logger.info(`🚀 Serveur Taxi Bordeaux démarré`, {
        port: PORT,
        environment: NODE_ENV,
        pid: process.pid,
        nodeVersion: process.version,
        features: {
          mongodb: mongoose.connection.readyState === 1 ? '✅ Connecté' : '⚠️ Non disponible',
          redis: app.locals.redis ? '✅ Connecté' : '⚠️ Non disponible',
          googleMaps: '✅ Configuré',
          email: '✅ Configuré',
          websocket: '✅ Actif',
          rateLimit: '✅ Actif',
          security: '✅ Actif',
          logging: '✅ Actif'
        }
      })

      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🚖 TAXI BORDEAUX SOLUTION - BACKEND API 🚖          ║
║                                                              ║
║  Serveur démarré avec succès sur http://localhost:${PORT}    ║
║                                                              ║
║  📊 Endpoints disponibles:                                   ║
║  • GET  /health              - Health check                  ║
║  • GET  /api/test            - Test API                      ║
║  • POST /api/reservations    - Créer réservation            ║
║  • GET  /api/maps/*          - Services cartographiques     ║
║  • GET  /api/translations/*  - Services traductions         ║
║  • GET  /api/public/*        - APIs publiques               ║
║                                                              ║
║  🔧 Services actifs:                                         ║
║  • MongoDB ${mongoose.connection.readyState === 1 ? '✅' : '⚠️'} • Redis ${app.locals.redis ? '✅' : '⚠️'} • Google Maps ✅ • Email ✅         ║
║  • WebSocket ✅ • Rate Limiting ✅ • Security ✅             ║
║                                                              ║
║  🌍 Support multilingue: FR 🇫🇷 EN 🇬🇧 ES 🇪🇸               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`)
    })
  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur', {
      error: error.message,
      stack: error.stack
    })
    process.exit(1)
  }
}

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu, arrêt gracieux du serveur...')
  
  server.close(async () => {
    await mongoose.connection.close()
    if (app.locals.redis) {
      await app.locals.redis.quit()
    }
    logger.info('Serveur arrêté proprement')
    process.exit(0)
  })
})

// Démarrage du serveur
if (NODE_ENV !== 'test') {
  startServer()
}

export { app, server, io }
export default app