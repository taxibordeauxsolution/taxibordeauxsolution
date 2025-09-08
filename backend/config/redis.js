/**
 * CONFIGURATION REDIS POUR CACHE ET SESSIONS
 * Cache intelligent multilingue avec TTL adaptatif
 */

import { createClient } from 'redis'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

let redisClient = null

/**
 * Configuration et connexion Redis
 */
export const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    const config = {
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Trop de tentatives de reconnexion')
            return new Error('Trop de tentatives de reconnexion Redis')
          }
          return Math.min(retries * 50, 2000) // Backoff exponentiel
        }
      },
      // Configuration pour production
      ...(process.env.NODE_ENV === 'production' && {
        socket: {
          ...config?.socket,
          tls: true,
          rejectUnauthorized: false
        }
      })
    }

    redisClient = createClient(config)

    // Gestionnaires d'événements
    redisClient.on('connect', () => {
      logger.info('🔄 Connexion à Redis en cours...')
    })

    redisClient.on('ready', () => {
      logger.info('✅ Redis connecté et prêt', {
        url: redisUrl.replace(/\/\/.*@/, '//***:***@'),
        database: redisClient.options?.database || 0
      })
    })

    redisClient.on('error', (error) => {
      logger.error('❌ Erreur Redis', { error: error.message })
    })

    redisClient.on('end', () => {
      logger.warn('⚠️ Connexion Redis fermée')
    })

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Reconnexion à Redis...')
    })

    // Connexion
    await redisClient.connect()

    // Test de fonctionnement
    await redisClient.ping()
    logger.info('✅ Redis ping successful')

    return redisClient

  } catch (error) {
    logger.error('❌ Erreur connexion Redis', { error: error.message })
    throw error
  }
}

/**
 * Service de cache intelligent
 */
export class CacheService {
  constructor(client) {
    this.client = client
    this.defaultTTL = {
      translations: parseInt(process.env.CACHE_TTL_TRANSLATIONS) || 86400, // 24h
      routes: parseInt(process.env.CACHE_TTL_ROUTES) || 3600, // 1h
      pricing: parseInt(process.env.CACHE_TTL_PRICING) || 1800, // 30min
      drivers: 300, // 5min
      short: 300, // 5min
      medium: 1800, // 30min
      long: 86400 // 24h
    }
  }

  /**
   * Génère une clé de cache structurée
   */
  generateKey(namespace, identifier, language = null) {
    const parts = ['taxi-bordeaux', namespace, identifier]
    if (language) parts.push(language)
    return parts.join(':')
  }

  /**
   * Cache des traductions par langue
   */
  async cacheTranslations(language, translations) {
    const key = this.generateKey('translations', 'all', language)
    try {
      await this.client.setEx(
        key,
        this.defaultTTL.translations,
        JSON.stringify(translations)
      )
      logger.debug(`Traductions ${language} mises en cache`, { key })
      return true
    } catch (error) {
      logger.error('Erreur cache traductions', { error: error.message, key })
      return false
    }
  }

  /**
   * Récupère les traductions depuis le cache
   */
  async getTranslations(language) {
    const key = this.generateKey('translations', 'all', language)
    try {
      const cached = await this.client.get(key)
      if (cached) {
        logger.debug(`Traductions ${language} trouvées en cache`, { key })
        return JSON.parse(cached)
      }
      return null
    } catch (error) {
      logger.error('Erreur récupération traductions cache', { error: error.message, key })
      return null
    }
  }

  /**
   * Cache des itinéraires Google Maps
   */
  async cacheRoute(fromLat, fromLng, toLat, toLng, routeData) {
    const identifier = `${fromLat.toFixed(4)}-${fromLng.toFixed(4)}_${toLat.toFixed(4)}-${toLng.toFixed(4)}`
    const key = this.generateKey('routes', identifier)
    
    try {
      await this.client.setEx(
        key,
        this.defaultTTL.routes,
        JSON.stringify({
          ...routeData,
          cachedAt: new Date().toISOString()
        })
      )
      logger.debug('Itinéraire mis en cache', { key, distance: routeData.distance })
      return true
    } catch (error) {
      logger.error('Erreur cache itinéraire', { error: error.message, key })
      return false
    }
  }

  /**
   * Récupère un itinéraire depuis le cache
   */
  async getRoute(fromLat, fromLng, toLat, toLng) {
    const identifier = `${fromLat.toFixed(4)}-${fromLng.toFixed(4)}_${toLat.toFixed(4)}-${toLng.toFixed(4)}`
    const key = this.generateKey('routes', identifier)
    
    try {
      const cached = await this.client.get(key)
      if (cached) {
        const routeData = JSON.parse(cached)
        logger.debug('Itinéraire trouvé en cache', { key, age: Date.now() - new Date(routeData.cachedAt) })
        return routeData
      }
      return null
    } catch (error) {
      logger.error('Erreur récupération itinéraire cache', { error: error.message, key })
      return null
    }
  }

  /**
   * Cache des prix calculés
   */
  async cachePricing(distance, passengers, luggage, isNight, pricing) {
    const identifier = `${distance.toFixed(1)}-${passengers}-${luggage}-${isNight ? 'night' : 'day'}`
    const key = this.generateKey('pricing', identifier)
    
    try {
      await this.client.setEx(
        key,
        this.defaultTTL.pricing,
        JSON.stringify({
          ...pricing,
          cachedAt: new Date().toISOString()
        })
      )
      logger.debug('Prix mis en cache', { key, total: pricing.totalPrice })
      return true
    } catch (error) {
      logger.error('Erreur cache prix', { error: error.message, key })
      return false
    }
  }

  /**
   * Récupère un prix depuis le cache
   */
  async getPricing(distance, passengers, luggage, isNight) {
    const identifier = `${distance.toFixed(1)}-${passengers}-${luggage}-${isNight ? 'night' : 'day'}`
    const key = this.generateKey('pricing', identifier)
    
    try {
      const cached = await this.client.get(key)
      if (cached) {
        const pricing = JSON.parse(cached)
        logger.debug('Prix trouvé en cache', { key, total: pricing.totalPrice })
        return pricing
      }
      return null
    } catch (error) {
      logger.error('Erreur récupération prix cache', { error: error.message, key })
      return null
    }
  }

  /**
   * Cache des chauffeurs disponibles par zone
   */
  async cacheAvailableDrivers(lat, lng, radius, drivers) {
    const identifier = `${lat.toFixed(3)}-${lng.toFixed(3)}-${radius}`
    const key = this.generateKey('drivers', identifier)
    
    try {
      await this.client.setEx(
        key,
        this.defaultTTL.drivers,
        JSON.stringify({
          drivers,
          count: drivers.length,
          cachedAt: new Date().toISOString()
        })
      )
      logger.debug('Chauffeurs disponibles mis en cache', { key, count: drivers.length })
      return true
    } catch (error) {
      logger.error('Erreur cache chauffeurs', { error: error.message, key })
      return false
    }
  }

  /**
   * Récupère les chauffeurs disponibles depuis le cache
   */
  async getAvailableDrivers(lat, lng, radius) {
    const identifier = `${lat.toFixed(3)}-${lng.toFixed(3)}-${radius}`
    const key = this.generateKey('drivers', identifier)
    
    try {
      const cached = await this.client.get(key)
      if (cached) {
        const data = JSON.parse(cached)
        logger.debug('Chauffeurs trouvés en cache', { key, count: data.count })
        return data.drivers
      }
      return null
    } catch (error) {
      logger.error('Erreur récupération chauffeurs cache', { error: error.message, key })
      return null
    }
  }

  /**
   * Cache générique avec TTL personnalisé
   */
  async set(namespace, identifier, data, ttl = null, language = null) {
    const key = this.generateKey(namespace, identifier, language)
    const finalTTL = ttl || this.defaultTTL.medium
    
    try {
      await this.client.setEx(
        key,
        finalTTL,
        JSON.stringify({
          data,
          cachedAt: new Date().toISOString(),
          ttl: finalTTL
        })
      )
      logger.debug('Données mises en cache', { key, ttl: finalTTL })
      return true
    } catch (error) {
      logger.error('Erreur cache générique', { error: error.message, key })
      return false
    }
  }

  /**
   * Récupération générique
   */
  async get(namespace, identifier, language = null) {
    const key = this.generateKey(namespace, identifier, language)
    
    try {
      const cached = await this.client.get(key)
      if (cached) {
        const parsed = JSON.parse(cached)
        logger.debug('Données trouvées en cache', { 
          key, 
          age: Math.round((Date.now() - new Date(parsed.cachedAt)) / 1000) + 's'
        })
        return parsed.data
      }
      return null
    } catch (error) {
      logger.error('Erreur récupération cache générique', { error: error.message, key })
      return null
    }
  }

  /**
   * Suppression d'une clé
   */
  async delete(namespace, identifier, language = null) {
    const key = this.generateKey(namespace, identifier, language)
    
    try {
      const deleted = await this.client.del(key)
      logger.debug('Clé supprimée du cache', { key, deleted: deleted > 0 })
      return deleted > 0
    } catch (error) {
      logger.error('Erreur suppression cache', { error: error.message, key })
      return false
    }
  }

  /**
   * Suppression par pattern (namespace)
   */
  async deletePattern(pattern) {
    try {
      const keys = await this.client.keys(`taxi-bordeaux:${pattern}:*`)
      if (keys.length > 0) {
        const deleted = await this.client.del(keys)
        logger.info('Clés supprimées par pattern', { pattern, deleted })
        return deleted
      }
      return 0
    } catch (error) {
      logger.error('Erreur suppression pattern cache', { error: error.message, pattern })
      return 0
    }
  }

  /**
   * Statistiques du cache
   */
  async getStats() {
    try {
      const info = await this.client.info('memory')
      const keyspace = await this.client.info('keyspace')
      
      return {
        connected: this.client.isReady,
        memory: info,
        keyspace: keyspace,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Erreur récupération stats Redis', { error: error.message })
      return null
    }
  }

  /**
   * Nettoyage périodique du cache
   */
  async cleanup() {
    try {
      const patterns = ['routes', 'pricing', 'drivers']
      let totalDeleted = 0
      
      for (const pattern of patterns) {
        const deleted = await this.deletePattern(pattern)
        totalDeleted += deleted
      }
      
      logger.info('Nettoyage cache terminé', { deleted: totalDeleted })
      return totalDeleted
    } catch (error) {
      logger.error('Erreur nettoyage cache', { error: error.message })
      return 0
    }
  }
}

/**
 * Fermeture propre de Redis
 */
export const disconnectRedis = async () => {
  try {
    if (redisClient && redisClient.isReady) {
      await redisClient.quit()
      logger.info('✅ Redis déconnecté proprement')
    }
  } catch (error) {
    logger.error('❌ Erreur déconnexion Redis', { error: error.message })
  }
}

/**
 * Instance globale du service de cache
 */
export const getCacheService = () => {
  if (!redisClient) {
    throw new Error('Redis client non initialisé')
  }
  return new CacheService(redisClient)
}

export { redisClient }
export default { connectRedis, disconnectRedis, getCacheService, CacheService }