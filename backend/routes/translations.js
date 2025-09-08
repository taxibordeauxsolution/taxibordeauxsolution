/**
 * ROUTES API TRADUCTIONS MULTILINGUES
 * Endpoints pour récupérer les traductions dans différentes langues
 */

import express from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { getTranslations, translate } from '../middleware/language.js'

const router = express.Router()

/**
 * GET /api/translations
 * Récupère toutes les traductions pour une langue donnée
 */
router.get('/', asyncHandler(async (req, res) => {
  const language = req.language || req.query.lang || 'fr'
  
  const translations = getTranslations(language)
  
  res.json({
    success: true,
    data: {
      language: language,
      translations: translations,
      availableLanguages: ['fr', 'en', 'es']
    }
  })
}))

/**
 * GET /api/translations/:key
 * Récupère la traduction d'une clé spécifique
 */
router.get('/:key', asyncHandler(async (req, res) => {
  const { key } = req.params
  const language = req.language || req.query.lang || 'fr'
  const fallback = req.query.fallback || null
  
  const translation = translate(key, language, fallback)
  
  res.json({
    success: true,
    data: {
      key: key,
      language: language,
      translation: translation,
      fallback: fallback
    }
  })
}))

/**
 * POST /api/translations/batch
 * Récupère plusieurs traductions en une seule requête
 */
router.post('/batch', asyncHandler(async (req, res) => {
  const { keys } = req.body
  const language = req.language || req.body.language || 'fr'
  
  if (!Array.isArray(keys)) {
    return res.status(400).json({
      success: false,
      error: 'Keys must be an array'
    })
  }
  
  const translations = {}
  keys.forEach(key => {
    translations[key] = translate(key, language)
  })
  
  res.json({
    success: true,
    data: {
      language: language,
      translations: translations
    }
  })
}))

export default router