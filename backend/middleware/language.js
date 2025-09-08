/**
 * MIDDLEWARE DÉTECTION LANGUE MULTILINGUE
 * Détection automatique via headers Accept-Language et IP
 */

import acceptLanguage from 'accept-language'
import geoip from 'geoip-lite'

// Configuration des langues supportées
acceptLanguage.languages(['fr', 'en', 'es'])

/**
 * Middleware de détection de langue
 */
export const languageMiddleware = (req, res, next) => {
  let detectedLanguage = 'fr' // Langue par défaut

  try {
    // 1. Priorité : paramètre d'URL
    if (req.query.lang && ['fr', 'en', 'es'].includes(req.query.lang)) {
      detectedLanguage = req.query.lang
    }
    // 2. Header Accept-Language
    else if (req.headers['accept-language']) {
      const browserLanguage = acceptLanguage.get(req.headers['accept-language'])
      if (browserLanguage) {
        detectedLanguage = browserLanguage
      }
    }
    // 3. Géolocalisation IP (fallback)
    else if (req.ip && req.ip !== '127.0.0.1' && req.ip !== '::1') {
      const geo = geoip.lookup(req.ip)
      if (geo && geo.country) {
        // Mapping pays -> langue
        const countryLanguageMap = {
          'FR': 'fr',
          'BE': 'fr',
          'CH': 'fr',
          'CA': 'fr',
          'US': 'en',
          'GB': 'en',
          'AU': 'en',
          'IE': 'en',
          'ES': 'es',
          'AR': 'es',
          'MX': 'es',
          'CO': 'es',
          'CL': 'es'
        }
        detectedLanguage = countryLanguageMap[geo.country] || 'fr'
      }
    }

    // Attacher la langue détectée à la requête
    req.language = detectedLanguage
    req.geo = req.ip ? geoip.lookup(req.ip) : null

    // Header de réponse pour indiquer la langue détectée
    res.set('Content-Language', detectedLanguage)

  } catch (error) {
    // En cas d'erreur, utiliser le français par défaut
    req.language = 'fr'
    req.geo = null
  }

  next()
}

/**
 * Fonction utilitaire pour obtenir les traductions
 */
export const getTranslations = (language = 'fr') => {
  const translations = {
    fr: {
      // Messages d'erreur
      validation_error: 'Données invalides',
      required_field: 'Ce champ est obligatoire',
      invalid_phone: 'Numéro de téléphone invalide',
      invalid_email: 'Adresse email invalide',
      invalid_coordinates: 'Coordonnées invalides',
      out_of_service_area: 'Zone hors service',
      route_not_found: 'Itinéraire non trouvé',
      
      // Messages de succès
      reservation_created: 'Réservation créée avec succès',
      email_sent: 'Email envoyé avec succès',
      
      // Messages système
      service_unavailable: 'Service temporairement indisponible',
      rate_limit_exceeded: 'Trop de requêtes, veuillez patienter',
      internal_error: 'Erreur interne du serveur'
    },
    en: {
      // Messages d'erreur
      validation_error: 'Invalid data',
      required_field: 'This field is required',
      invalid_phone: 'Invalid phone number',
      invalid_email: 'Invalid email address',
      invalid_coordinates: 'Invalid coordinates',
      out_of_service_area: 'Out of service area',
      route_not_found: 'Route not found',
      
      // Messages de succès
      reservation_created: 'Booking created successfully',
      email_sent: 'Email sent successfully',
      
      // Messages système
      service_unavailable: 'Service temporarily unavailable',
      rate_limit_exceeded: 'Too many requests, please wait',
      internal_error: 'Internal server error'
    },
    es: {
      // Messages d'erreur
      validation_error: 'Datos inválidos',
      required_field: 'Este campo es obligatorio',
      invalid_phone: 'Número de teléfono inválido',
      invalid_email: 'Dirección de email inválida',
      invalid_coordinates: 'Coordenadas inválidas',
      out_of_service_area: 'Fuera del área de servicio',
      route_not_found: 'Ruta no encontrada',
      
      // Messages de succès
      reservation_created: 'Reserva creada con éxito',
      email_sent: 'Email enviado con éxito',
      
      // Messages système
      service_unavailable: 'Servicio temporalmente no disponible',
      rate_limit_exceeded: 'Demasiadas solicitudes, por favor espere',
      internal_error: 'Error interno del servidor'
    }
  }

  return translations[language] || translations.fr
}

/**
 * Fonction helper pour traduire un message
 */
export const translate = (key, language = 'fr', fallback = null) => {
  const translations = getTranslations(language)
  return translations[key] || fallback || key
}

/**
 * Middleware pour ajouter la fonction de traduction à req
 */
export const addTranslationHelpers = (req, res, next) => {
  req.t = (key, fallback = null) => translate(key, req.language, fallback)
  req.getTranslations = () => getTranslations(req.language)
  next()
}

export default { languageMiddleware, getTranslations, translate, addTranslationHelpers }