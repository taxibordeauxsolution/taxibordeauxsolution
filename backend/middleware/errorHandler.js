/**
 * MIDDLEWARE GESTION D'ERREURS GLOBALE
 * Gestion centralisée des erreurs avec logging et réponses multilingues
 */

import winston from 'winston'
import { translate } from './language.js'

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/errors.log' })
  ]
})

/**
 * Classes d'erreurs personnalisées
 */
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
    this.details = details
    this.code = 'VALIDATION_ERROR'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
    this.statusCode = 404
    this.code = 'NOT_FOUND'
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = 'Service temporarily unavailable') {
    super(message)
    this.name = 'ServiceUnavailableError'
    this.statusCode = 503
    this.code = 'SERVICE_UNAVAILABLE'
  }
}

export class OutOfServiceAreaError extends Error {
  constructor(message = 'Out of service area') {
    super(message)
    this.name = 'OutOfServiceAreaError'
    this.statusCode = 400
    this.code = 'OUT_OF_SERVICE_AREA'
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Too many requests') {
    super(message)
    this.name = 'RateLimitError'
    this.statusCode = 429
    this.code = 'RATE_LIMIT_EXCEEDED'
  }
}

/**
 * Middleware principal de gestion d'erreurs
 */
export const errorHandler = (error, req, res, next) => {
  const language = req.language || 'fr'
  
  // Log de l'erreur
  const errorLog = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    language: language,
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  }

  logger.error('API Error', errorLog)

  // Déterminer le statut et le message selon le type d'erreur
  let statusCode = 500
  let message = translate('internal_error', language, 'Internal server error')
  let code = 'INTERNAL_ERROR'
  let details = null

  if (error.statusCode && error.code) {
    // Erreurs personnalisées
    statusCode = error.statusCode
    code = error.code
    details = error.details
    
    // Traduire le message selon l'erreur
    switch (error.code) {
      case 'VALIDATION_ERROR':
        message = translate('validation_error', language, error.message)
        break
      case 'NOT_FOUND':
        message = translate('not_found', language, error.message)
        break
      case 'SERVICE_UNAVAILABLE':
        message = translate('service_unavailable', language, error.message)
        break
      case 'OUT_OF_SERVICE_AREA':
        message = translate('out_of_service_area', language, error.message)
        break
      case 'RATE_LIMIT_EXCEEDED':
        message = translate('rate_limit_exceeded', language, error.message)
        break
      default:
        message = error.message
    }
  } 
  // Erreurs Mongoose
  else if (error.name === 'ValidationError') {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = translate('validation_error', language)
    details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }))
  }
  else if (error.name === 'CastError') {
    statusCode = 400
    code = 'INVALID_ID'
    message = translate('invalid_id', language, 'Invalid ID format')
  }
  else if (error.code === 11000) {
    // Erreur de duplication MongoDB
    statusCode = 409
    code = 'DUPLICATE_ENTRY'
    message = translate('duplicate_entry', language, 'Duplicate entry')
    
    const field = Object.keys(error.keyValue)[0]
    details = { field, value: error.keyValue[field] }
  }
  // Erreurs JWT
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    code = 'INVALID_TOKEN'
    message = translate('invalid_token', language, 'Invalid token')
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    code = 'TOKEN_EXPIRED'
    message = translate('token_expired', language, 'Token expired')
  }
  // Erreurs Joi
  else if (error.name === 'ValidationError' && error.isJoi) {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = translate('validation_error', language)
    details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }))
  }
  // Erreur de syntaxe JSON
  else if (error.type === 'entity.parse.failed') {
    statusCode = 400
    code = 'INVALID_JSON'
    message = translate('invalid_json', language, 'Invalid JSON format')
  }

  // Construction de la réponse d'erreur
  const errorResponse = {
    success: false,
    error: message,
    code: code,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      originalError: error.message
    }),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  }

  // Ajout d'informations spécifiques selon le type d'erreur
  if (statusCode === 429) {
    errorResponse.retryAfter = '15 minutes'
  }

  if (statusCode >= 500) {
    // Erreurs serveur - ne pas exposer les détails en production
    if (process.env.NODE_ENV === 'production') {
      errorResponse.error = translate('internal_error', language)
      delete errorResponse.details
      delete errorResponse.stack
      delete errorResponse.originalError
    }

    // Notifier les erreurs critiques (Sentry, Slack, etc.)
    if (process.env.SENTRY_DSN) {
      // Intégration Sentry ici
    }
  }

  res.status(statusCode).json(errorResponse)
}

/**
 * Middleware pour les routes non trouvées
 */
export const notFoundHandler = (req, res) => {
  const language = req.language || 'fr'
  
  res.status(404).json({
    success: false,
    error: translate('route_not_found', language, 'Route not found'),
    code: 'ROUTE_NOT_FOUND',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /health',
      'GET /api/test',
      'POST /api/reservations',
      'GET /api/reservations/:id',
      'POST /api/maps/calculate-route',
      'POST /api/maps/geocode',
      'GET /api/maps/places/autocomplete'
    ]
  })
}

/**
 * Wrapper pour les routes async
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Middleware de validation des erreurs connues
 */
export const handleKnownErrors = (req, res, next) => {
  // Augmenter res avec des méthodes helper pour les erreurs courantes
  res.badRequest = (message, details = null) => {
    throw new ValidationError(message, details)
  }

  res.notFound = (message = null) => {
    throw new NotFoundError(message)
  }

  res.serviceUnavailable = (message = null) => {
    throw new ServiceUnavailableError(message)
  }

  res.outOfServiceArea = (message = null) => {
    throw new OutOfServiceAreaError(message)
  }

  next()
}

/**
 * Logging des erreurs non gérées
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise,
    timestamp: new Date().toISOString()
  })
})

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleKnownErrors,
  ValidationError,
  NotFoundError,
  ServiceUnavailableError,
  OutOfServiceAreaError,
  RateLimitError
}