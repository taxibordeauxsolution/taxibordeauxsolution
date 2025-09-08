/**
 * SERVICE DE CALCUL DES PRIX TAXI BORDEAUX
 * Tarifs officiels 2025 avec toutes les majorations et suppléments
 */

import winston from 'winston'
import { getCacheService } from '../config/redis.js'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

/**
 * Service de pricing intelligent avec cache
 */
export class PricingService {
  constructor() {
    this.cacheService = null
    
    // Initialiser le cache si disponible
    try {
      this.cacheService = getCacheService()
    } catch (error) {
      logger.warn('Cache Redis non disponible pour Pricing Service')
    }

    // Tarifs officiels Bordeaux 2025 (source Préfecture de Gironde)
    this.rates = {
      // Tarifs de base (en euros)
      baseFare: parseFloat(process.env.PRICING_BASE_FARE) || 2.80,
      dayRate: parseFloat(process.env.PRICING_DAY_RATE) || 2.12,
      nightRate: parseFloat(process.env.PRICING_NIGHT_RATE) || 3.18,
      waitRate: parseFloat(process.env.PRICING_WAIT_RATE) || 41.61, // par heure
      
      // Suppléments
      luggageSupplement: parseFloat(process.env.PRICING_LUGGAGE_SUPPLEMENT) || 2.00, // 4e bagage et +
      fifthPassenger: parseFloat(process.env.PRICING_FIFTH_PASSENGER) || 4.00, // 5e passager et +
      
      // Majorations spéciales
      airportSupplement: 0, // Pas de supplément aéroport à Bordeaux
      stationSupplement: 0, // Pas de supplément gare
      nightSupplement: 0, // Inclus dans nightRate
      
      // Majorations exceptionnelles
      holidaySupplement: 0, // Pas de majoration jours fériés
      eventSupplement: 0, // Possible selon événements
      weatherSupplement: 0, // Possible selon conditions météo
      
      // Minimums et maximums
      minimumFare: 7.30, // Minimum légal
      maximumWaitTime: 60, // minutes avant négociation
      
      // Configuration heures
      nightStart: process.env.NIGHT_RATE_START || '21:00',
      nightEnd: process.env.NIGHT_RATE_END || '07:00'
    }

    // Zones spéciales avec tarifs particuliers
    this.specialZones = {
      airport: {
        name: 'Aéroport Bordeaux-Mérignac',
        supplement: 0,
        bounds: {
          lat: { min: 44.8250, max: 44.8350 },
          lng: { min: -0.7200, max: -0.7000 }
        }
      },
      trainStation: {
        name: 'Gare Saint-Jean',
        supplement: 0,
        bounds: {
          lat: { min: 44.8200, max: 44.8280 },
          lng: { min: -0.5800, max: -0.5700 }
        }
      }
    }

    // Jours fériés français (dates fixes et variables)
    this.holidays = this.generateHolidays(new Date().getFullYear())
  }

  /**
   * Calcul principal du prix d'un trajet
   */
  async calculatePrice(options = {}) {
    try {
      const {
        distance = 0,
        duration = 0,
        passengers = 1,
        luggage = 0,
        departureTime = new Date(),
        fromCoords = null,
        toCoords = null,
        waitTime = 0,
        specialRequests = {},
        language = 'fr'
      } = options

      // Validation des paramètres
      if (distance <= 0) {
        throw new Error('Distance must be positive')
      }

      // Vérifier le cache
      const cacheKey = this.generateCacheKey(options)
      if (this.cacheService) {
        const cached = await this.cacheService.get('pricing', cacheKey, language)
        if (cached) {
          logger.debug('Prix trouvé en cache', { cacheKey })
          return cached
        }
      }

      // Déterminer les conditions tarifaires
      const conditions = this.determinePricingConditions(departureTime, fromCoords, toCoords)
      
      // Calculs étape par étape
      const calculation = {
        // 1. Prise en charge
        baseFare: this.rates.baseFare,
        
        // 2. Prix kilométrique
        kmRate: conditions.isNight ? this.rates.nightRate : this.rates.dayRate,
        distanceFare: distance * (conditions.isNight ? this.rates.nightRate : this.rates.dayRate),
        
        // 3. Temps d'attente
        waitFare: waitTime > 0 ? (waitTime / 60) * this.rates.waitRate : 0,
        
        // 4. Suppléments passagers
        passengerSupplement: Math.max(0, passengers - 4) * this.rates.fifthPassenger,
        
        // 5. Suppléments bagages
        luggageSupplement: Math.max(0, luggage - 3) * this.rates.luggageSupplement,
        
        // 6. Suppléments zones spéciales
        zoneSupplement: this.calculateZoneSupplements(fromCoords, toCoords),
        
        // 7. Suppléments spéciaux
        specialSupplement: this.calculateSpecialSupplements(conditions, specialRequests),
        
        // Conditions appliquées
        conditions: conditions
      }

      // Calcul du prix total
      const subtotal = calculation.baseFare + 
                      calculation.distanceFare + 
                      calculation.waitFare + 
                      calculation.passengerSupplement + 
                      calculation.luggageSupplement + 
                      calculation.zoneSupplement + 
                      calculation.specialSupplement

      // Application du minimum légal
      const totalPrice = Math.max(subtotal, this.rates.minimumFare)

      // Arrondi à 2 décimales
      const finalPrice = Math.round(totalPrice * 100) / 100

      // Construction du résultat détaillé
      const result = {
        totalPrice: finalPrice,
        currency: 'EUR',
        locale: language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR',
        
        // Détail du calcul
        breakdown: {
          baseFare: calculation.baseFare,
          distanceFare: Math.round(calculation.distanceFare * 100) / 100,
          waitFare: Math.round(calculation.waitFare * 100) / 100,
          passengerSupplement: calculation.passengerSupplement,
          luggageSupplement: calculation.luggageSupplement,
          zoneSupplement: calculation.zoneSupplement,
          specialSupplement: calculation.specialSupplement,
          subtotal: Math.round(subtotal * 100) / 100,
          minimumApplied: finalPrice === this.rates.minimumFare
        },
        
        // Détails des conditions
        conditions: {
          distance: distance,
          duration: duration,
          passengers: passengers,
          luggage: luggage,
          waitTime: waitTime,
          isNightRate: conditions.isNight,
          isWeekend: conditions.isWeekend,
          isHoliday: conditions.isHoliday,
          specialZone: conditions.specialZone,
          departureTime: departureTime
        },
        
        // Tarification appliquée
        ratesUsed: {
          baseFare: this.rates.baseFare,
          kmRate: calculation.kmRate,
          waitRate: this.rates.waitRate,
          luggageRate: this.rates.luggageSupplement,
          passengerRate: this.rates.fifthPassenger
        },
        
        // Métadonnées
        calculatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
        source: 'official_rates_2025'
      }

      // Mettre en cache
      if (this.cacheService) {
        await this.cacheService.set('pricing', cacheKey, result, 1800, language) // 30 min
      }

      logger.info('Prix calculé', {
        distance,
        passengers,
        luggage,
        totalPrice: finalPrice,
        conditions: conditions.isNight ? 'night' : 'day'
      })

      return result

    } catch (error) {
      logger.error('Erreur calcul prix', { error: error.message, options })
      throw error
    }
  }

  /**
   * Détermine les conditions tarifaires selon l'heure et la date
   */
  determinePricingConditions(departureTime, fromCoords, toCoords) {
    const date = new Date(departureTime)
    const time = date.toTimeString().slice(0, 5) // HH:MM format
    const dayOfWeek = date.getDay() // 0 = dimanche
    
    // Vérification tarif nuit
    const isNight = this.isNightTime(time)
    
    // Vérification weekend
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // Vérification jour férié
    const dateString = date.toISOString().slice(0, 10)
    const isHoliday = this.holidays.includes(dateString)
    
    // Vérification zone spéciale
    const specialZone = this.detectSpecialZone(fromCoords, toCoords)
    
    // Conditions météo (peut être étendu avec API météo)
    const weatherConditions = this.getWeatherConditions()
    
    return {
      isNight,
      isWeekend,
      isHoliday,
      specialZone,
      weatherConditions,
      originalTime: time,
      dayOfWeek
    }
  }

  /**
   * Vérifie si c'est l'heure de tarif nuit
   */
  isNightTime(time) {
    const nightStart = this.rates.nightStart
    const nightEnd = this.rates.nightEnd
    
    // Convertir en minutes depuis minuit
    const timeMinutes = this.timeToMinutes(time)
    const startMinutes = this.timeToMinutes(nightStart)
    const endMinutes = this.timeToMinutes(nightEnd)
    
    // Gérer le passage minuit
    if (startMinutes > endMinutes) {
      // Exemple: 21:00 à 07:00
      return timeMinutes >= startMinutes || timeMinutes < endMinutes
    } else {
      // Exemple: 23:00 à 05:00 (cas normal)
      return timeMinutes >= startMinutes && timeMinutes < endMinutes
    }
  }

  /**
   * Convertit une heure HH:MM en minutes depuis minuit
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  /**
   * Calcule les suppléments de zones spéciales
   */
  calculateZoneSupplements(fromCoords, toCoords) {
    let supplement = 0
    
    if (fromCoords && toCoords) {
      // Vérifier si départ ou arrivée dans une zone spéciale
      for (const [zoneId, zone] of Object.entries(this.specialZones)) {
        const fromInZone = this.isInZone(fromCoords, zone.bounds)
        const toInZone = this.isInZone(toCoords, zone.bounds)
        
        if (fromInZone || toInZone) {
          supplement += zone.supplement
          logger.debug(`Supplément zone ${zone.name}`, { supplement: zone.supplement })
        }
      }
    }
    
    return supplement
  }

  /**
   * Calcule les suppléments spéciaux
   */
  calculateSpecialSupplements(conditions, specialRequests) {
    let supplement = 0
    
    // Supplément jours fériés (si configuré)
    if (conditions.isHoliday && this.rates.holidaySupplement > 0) {
      supplement += this.rates.holidaySupplement
    }
    
    // Supplément météo (si conditions difficiles)
    if (conditions.weatherConditions && conditions.weatherConditions.difficult) {
      supplement += this.rates.weatherSupplement
    }
    
    // Suppléments pour demandes spéciales
    if (specialRequests.childSeat) supplement += 0 // Gratuit à Bordeaux
    if (specialRequests.wheelchair) supplement += 0 // Gratuit
    if (specialRequests.animal) supplement += 0 // Gratuit si petit animal
    
    return supplement
  }

  /**
   * Détecte la zone spéciale
   */
  detectSpecialZone(fromCoords, toCoords) {
    if (!fromCoords && !toCoords) return null
    
    for (const [zoneId, zone] of Object.entries(this.specialZones)) {
      const fromInZone = fromCoords ? this.isInZone(fromCoords, zone.bounds) : false
      const toInZone = toCoords ? this.isInZone(toCoords, zone.bounds) : false
      
      if (fromInZone || toInZone) {
        return {
          id: zoneId,
          name: zone.name,
          supplement: zone.supplement,
          fromInZone,
          toInZone
        }
      }
    }
    
    return null
  }

  /**
   * Vérifie si des coordonnées sont dans une zone
   */
  isInZone(coords, bounds) {
    return coords.lat >= bounds.lat.min &&
           coords.lat <= bounds.lat.max &&
           coords.lng >= bounds.lng.min &&
           coords.lng <= bounds.lng.max
  }

  /**
   * Obtient les conditions météorologiques
   */
  getWeatherConditions() {
    // Placeholder pour intégration API météo future
    return {
      difficult: false,
      condition: 'normal'
    }
  }

  /**
   * Génère une clé de cache pour la tarification
   */
  generateCacheKey(options) {
    const {
      distance,
      passengers,
      luggage,
      departureTime,
      waitTime
    } = options
    
    const date = new Date(departureTime)
    const hour = date.getHours()
    const day = date.toISOString().slice(0, 10)
    
    return `${distance.toFixed(1)}-${passengers}-${luggage}-${waitTime}-${day}-${hour}`
  }

  /**
   * Génère la liste des jours fériés français pour une année
   */
  generateHolidays(year) {
    const holidays = []
    
    // Jours fériés fixes
    holidays.push(`${year}-01-01`) // Jour de l'An
    holidays.push(`${year}-05-01`) // Fête du Travail
    holidays.push(`${year}-05-08`) // Victoire 1945
    holidays.push(`${year}-07-14`) // Fête Nationale
    holidays.push(`${year}-08-15`) // Assomption
    holidays.push(`${year}-11-01`) // Toussaint
    holidays.push(`${year}-11-11`) // Armistice
    holidays.push(`${year}-12-25`) // Noël
    
    // Jours fériés variables (Pâques)
    const easter = this.calculateEaster(year)
    holidays.push(this.formatDate(new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000))) // Lundi de Pâques
    holidays.push(this.formatDate(new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000))) // Ascension
    holidays.push(this.formatDate(new Date(easter.getTime() + 50 * 24 * 60 * 60 * 1000))) // Lundi de Pentecôte
    
    return holidays
  }

  /**
   * Calcule la date de Pâques pour une année donnée
   */
  calculateEaster(year) {
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31)
    const day = ((h + l - 7 * m + 114) % 31) + 1
    
    return new Date(year, month - 1, day)
  }

  /**
   * Formate une date au format YYYY-MM-DD
   */
  formatDate(date) {
    return date.toISOString().slice(0, 10)
  }

  /**
   * Obtient les tarifs actuels
   */
  getCurrentRates() {
    return {
      ...this.rates,
      lastUpdated: new Date().toISOString(),
      source: 'Prefecture de Gironde - Tarifs 2025'
    }
  }

  /**
   * Estimation rapide de prix (sans cache)
   */
  quickEstimate(distance, passengers = 1, luggage = 0, isNight = false) {
    const baseFare = this.rates.baseFare
    const kmRate = isNight ? this.rates.nightRate : this.rates.dayRate
    const distanceFare = distance * kmRate
    const passengerSupplement = Math.max(0, passengers - 4) * this.rates.fifthPassenger
    const luggageSupplement = Math.max(0, luggage - 3) * this.rates.luggageSupplement
    
    const total = baseFare + distanceFare + passengerSupplement + luggageSupplement
    return Math.max(total, this.rates.minimumFare)
  }

  /**
   * Statistiques d'utilisation
   */
  getUsageStats() {
    return {
      ratesVersion: '2025',
      lastRateUpdate: '2025-01-01',
      calculationsToday: 0, // À implémenter avec un compteur Redis
      averagePrice: 0, // À implémenter avec historique
      cacheHitRate: 0 // À implémenter avec métriques cache
    }
  }
}

// Instance globale
let pricingService = null

export const getPricingService = () => {
  if (!pricingService) {
    pricingService = new PricingService()
  }
  return pricingService
}

export default { PricingService, getPricingService }