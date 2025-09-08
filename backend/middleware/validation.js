/**
 * MIDDLEWARE DE VALIDATION MULTILINGUE
 * Validation avec Joi et messages d'erreur traduits
 */

import Joi from 'joi'
import { translate } from './language.js'

/**
 * Configuration Joi avec messages personnalisés multilingues
 */
const getJoiOptions = (language = 'fr') => {
  const messages = {
    fr: {
      'any.required': 'Ce champ est obligatoire',
      'string.empty': 'Ce champ ne peut pas être vide',
      'string.min': 'Ce champ doit contenir au moins {#limit} caractères',
      'string.max': 'Ce champ ne peut pas dépasser {#limit} caractères',
      'string.email': 'Adresse email invalide',
      'string.pattern.base': 'Format invalide',
      'number.base': 'Ce champ doit être un nombre',
      'number.min': 'La valeur doit être au moins {#limit}',
      'number.max': 'La valeur ne peut pas dépasser {#limit}',
      'date.base': 'Date invalide',
      'date.min': 'La date ne peut pas être dans le passé',
      'array.min': 'Au moins {#limit} élément(s) requis',
      'object.unknown': 'Champ non autorisé'
    },
    en: {
      'any.required': 'This field is required',
      'string.empty': 'This field cannot be empty',
      'string.min': 'This field must contain at least {#limit} characters',
      'string.max': 'This field cannot exceed {#limit} characters',
      'string.email': 'Invalid email address',
      'string.pattern.base': 'Invalid format',
      'number.base': 'This field must be a number',
      'number.min': 'Value must be at least {#limit}',
      'number.max': 'Value cannot exceed {#limit}',
      'date.base': 'Invalid date',
      'date.min': 'Date cannot be in the past',
      'array.min': 'At least {#limit} item(s) required',
      'object.unknown': 'Field not allowed'
    },
    es: {
      'any.required': 'Este campo es obligatorio',
      'string.empty': 'Este campo no puede estar vacío',
      'string.min': 'Este campo debe contener al menos {#limit} caracteres',
      'string.max': 'Este campo no puede exceder {#limit} caracteres',
      'string.email': 'Dirección de email inválida',
      'string.pattern.base': 'Formato inválido',
      'number.base': 'Este campo debe ser un número',
      'number.min': 'El valor debe ser al menos {#limit}',
      'number.max': 'El valor no puede exceder {#limit}',
      'date.base': 'Fecha inválida',
      'date.min': 'La fecha no puede estar en el pasado',
      'array.min': 'Al menos {#limit} elemento(s) requerido(s)',
      'object.unknown': 'Campo no permitido'
    }
  }

  return {
    errors: {
      language: 'en', // Joi utilise l'anglais en interne
      wrap: {
        label: false
      }
    },
    messages: messages[language] || messages.fr
  }
}

/**
 * Middleware de validation principal
 */
export const validationMiddleware = (schema) => {
  return async (req, res, next) => {
    try {
      const language = req.language || 'fr'
      const options = getJoiOptions(language)

      // Validation des données
      const { error, value } = schema.validate(req.body, options)

      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))

        return res.status(400).json({
          success: false,
          error: translate('validation_error', language, 'Validation error'),
          details: errorDetails,
          code: 'VALIDATION_ERROR'
        })
      }

      // Remplacer req.body par les valeurs validées
      req.body = value
      next()

    } catch (error) {
      console.error('Erreur middleware validation:', error)
      res.status(500).json({
        success: false,
        error: translate('internal_error', req.language, 'Internal server error'),
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

/**
 * Validation spécifique numéro de téléphone français
 */
export const validatePhoneNumber = (phone) => {
  // Regex pour numéros français (mobile et fixe)
  const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/
  const cleanPhone = phone.replace(/[\s.-]/g, '')
  return phoneRegex.test(cleanPhone)
}

/**
 * Validation coordonnées GPS
 */
export const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  )
}

/**
 * Validation zone de service Bordeaux
 */
export const validateServiceArea = (lat, lng) => {
  const bordeauxBounds = {
    north: parseFloat(process.env.SERVICE_ZONE_LAT_MAX) || 44.95,
    south: parseFloat(process.env.SERVICE_ZONE_LAT_MIN) || 44.7,
    east: parseFloat(process.env.SERVICE_ZONE_LNG_MAX) || -0.4,
    west: parseFloat(process.env.SERVICE_ZONE_LNG_MIN) || -0.8
  }

  return (
    lat >= bordeauxBounds.south &&
    lat <= bordeauxBounds.north &&
    lng >= bordeauxBounds.west &&
    lng <= bordeauxBounds.east
  )
}

/**
 * Schémas de validation communs
 */
export const commonSchemas = {
  // Coordonnées GPS
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }),

  // Numéro de téléphone français
  phoneNumber: Joi.string().custom((value, helpers) => {
    if (!validatePhoneNumber(value)) {
      return helpers.error('string.pattern.base')
    }
    return value
  }),

  // Email optionnel
  optionalEmail: Joi.string().email().allow('').optional(),

  // Langue supportée
  language: Joi.string().valid('fr', 'en', 'es').default('fr'),

  // Date future
  futureDate: Joi.date().min('now'),

  // Pagination
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0)
  })
}

/**
 * Validation middleware pour paramètres d'URL
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const language = req.language || 'fr'
    const options = getJoiOptions(language)

    const { error, value } = schema.validate(req.params, options)

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return res.status(400).json({
        success: false,
        error: translate('validation_error', language),
        details: errorDetails,
        code: 'PARAMS_VALIDATION_ERROR'
      })
    }

    req.params = value
    next()
  }
}

/**
 * Validation middleware pour query parameters
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const language = req.language || 'fr'
    const options = getJoiOptions(language)

    const { error, value } = schema.validate(req.query, options)

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return res.status(400).json({
        success: false,
        error: translate('validation_error', language),
        details: errorDetails,
        code: 'QUERY_VALIDATION_ERROR'
      })
    }

    req.query = value
    next()
  }
}

/**
 * Middleware de sanitization des données
 */
export const sanitizeInput = (req, res, next) => {
  // Fonction récursive de nettoyage
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim()
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize)
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {}
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value)
      }
      return sanitized
    }
    return obj
  }

  // Sanitizer body, params et query
  if (req.body) {
    req.body = sanitize(req.body)
  }
  if (req.params) {
    req.params = sanitize(req.params)
  }
  if (req.query) {
    req.query = sanitize(req.query)
  }

  next()
}

/**
 * Validation des headers requis
 */
export const validateHeaders = (requiredHeaders = []) => {
  return (req, res, next) => {
    const language = req.language || 'fr'
    const missingHeaders = []

    for (const header of requiredHeaders) {
      if (!req.headers[header.toLowerCase()]) {
        missingHeaders.push(header)
      }
    }

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        error: translate('validation_error', language),
        details: `Missing required headers: ${missingHeaders.join(', ')}`,
        code: 'MISSING_HEADERS'
      })
    }

    next()
  }
}

export default {
  validationMiddleware,
  validateParams,
  validateQuery,
  sanitizeInput,
  validateHeaders,
  validatePhoneNumber,
  validateCoordinates,
  validateServiceArea,
  commonSchemas
}