/**
 * CONFIGURATION MONGODB AVEC MONGOOSE
 * Connexion optimisée pour performance et sécurité
 */

import mongoose from 'mongoose'
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
})

/**
 * Configuration de connexion MongoDB
 */
const mongoConfig = {
  // Options de connexion optimisées
  maxPoolSize: 10, // Nombre max de connexions dans le pool
  serverSelectionTimeoutMS: 5000, // Timeout pour sélectionner le serveur
  socketTimeoutMS: 45000, // Timeout socket
  bufferCommands: false, // Disable mongoose buffering
  
  // Options de performance
  maxIdleTimeMS: 30000, // Fermer les connexions inactives après 30s
  compressors: ['zlib'], // Compression des données
  
  // Options de monitoring
  monitorCommands: true, // Log des commandes MongoDB
  
  // Options de sécurité
  authSource: 'admin', // Source d'authentification
  
  // Options de réplication (pour production)
  readPreference: 'primaryPreferred',
  retryWrites: true,
  w: 'majority'
}

/**
 * Gestionnaire d'événements MongoDB
 */
const setupMongooseEvents = () => {
  // Événements de connexion
  mongoose.connection.on('connected', () => {
    logger.info('✅ MongoDB connecté avec succès', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    })
  })

  mongoose.connection.on('error', (error) => {
    logger.error('❌ Erreur MongoDB', { error: error.message })
  })

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB déconnecté')
  })

  mongoose.connection.on('reconnected', () => {
    logger.info('🔄 MongoDB reconnecté')
  })

  // Log des requêtes lentes en développement
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug('MongoDB Query', {
        collection: collectionName,
        method,
        query: JSON.stringify(query),
        doc: doc ? JSON.stringify(doc) : undefined
      })
    })
  }
}

/**
 * Initialiser les index de performance
 */
const createIndexes = async () => {
  try {
    const collections = mongoose.connection.collections

    // Index pour les réservations
    if (collections.reservations) {
      await collections.reservations.createIndexes([
        { key: { reservationId: 1 }, unique: true },
        { key: { 'customer.phone': 1 } },
        { key: { createdAt: -1 } },
        { key: { status: 1, createdAt: -1 } },
        { key: { 'trip.from.coordinates': '2dsphere' } },
        { key: { 'trip.to.coordinates': '2dsphere' } },
        { key: { 'booking.scheduledDateTime': 1 } }
      ])
      logger.info('✅ Index réservations créés')
    }

    // Index pour les chauffeurs
    if (collections.drivers) {
      await collections.drivers.createIndexes([
        { key: { 'personalInfo.phone': 1 }, unique: true },
        { key: { 'personalInfo.email': 1 }, unique: true },
        { key: { 'personalInfo.licenseNumber': 1 }, unique: true },
        { key: { 'status.currentLocation': '2dsphere' } },
        { key: { 'status.availability': 1 } },
        { key: { 'personalInfo.spokenLanguages': 1 } }
      ])
      logger.info('✅ Index chauffeurs créés')
    }

    // Index pour les traductions
    if (collections.translations) {
      await collections.translations.createIndexes([
        { key: { language: 1, context: 1 } },
        { key: { key: 1, language: 1 }, unique: true }
      ])
      logger.info('✅ Index traductions créés')
    }

    // Index pour les clients
    if (collections.customers) {
      await collections.customers.createIndexes([
        { key: { phone: 1 }, unique: true },
        { key: { email: 1 }, sparse: true },
        { key: { preferredLanguage: 1 } },
        { key: { location: '2dsphere' } }
      ])
      logger.info('✅ Index clients créés')
    }

  } catch (error) {
    logger.error('❌ Erreur création des index', { error: error.message })
  }
}

/**
 * Fonction de connexion principale
 */
export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/taxi-bordeaux-test'
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/taxi-bordeaux'

    logger.info('🔄 Connexion à MongoDB...', { uri: mongoUri.replace(/\/\/.*@/, '//***:***@') })

    // Configuration des événements avant connexion
    setupMongooseEvents()

    // Connexion à MongoDB avec timeout plus court
    await mongoose.connect(mongoUri, {
      ...mongoConfig,
      serverSelectionTimeoutMS: 10000, // 10 secondes au lieu de 5
      connectTimeoutMS: 10000 // 10 secondes pour établir la connexion
    })

    // Création des index après connexion
    setTimeout(createIndexes, 1000) // Attendre que les modèles soient chargés

    return mongoose.connection
  } catch (error) {
    logger.error('❌ Erreur connexion MongoDB', { error: error.message, stack: error.stack })
    throw error
  }
}

/**
 * Fonction de déconnexion propre
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close()
    logger.info('✅ MongoDB déconnecté proprement')
  } catch (error) {
    logger.error('❌ Erreur déconnexion MongoDB', { error: error.message })
    throw error
  }
}

/**
 * Vérifier l'état de la connexion
 */
export const checkDatabaseConnection = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }
  
  return {
    state: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.name
  }
}

/**
 * Statistiques de la base de données
 */
export const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats()
    
    return {
      database: mongoose.connection.name,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      documents: stats.objects,
      avgObjSize: `${(stats.avgObjSize / 1024).toFixed(2)} KB`
    }
  } catch (error) {
    logger.error('❌ Erreur récupération stats DB', { error: error.message })
    return null
  }
}

/**
 * Fonction de sauvegarde des données importantes
 */
export const backupCriticalData = async () => {
  try {
    const collections = mongoose.connection.collections
    const backupData = {
      timestamp: new Date(),
      reservations: [],
      drivers: [],
      customers: []
    }

    // Sauvegarder les réservations actives
    if (collections.reservations) {
      const activeReservations = await collections.reservations
        .find({ status: { $in: ['pending', 'confirmed', 'assigned', 'in_progress'] } })
        .sort({ createdAt: -1 })
        .limit(1000)
        .toArray()
      
      backupData.reservations = activeReservations
    }

    // Sauvegarder les chauffeurs actifs
    if (collections.drivers) {
      const activeDrivers = await collections.drivers
        .find({ 'status.availability': { $in: ['available', 'busy'] } })
        .toArray()
      
      backupData.drivers = activeDrivers
    }

    logger.info('✅ Sauvegarde critique effectuée', {
      reservations: backupData.reservations.length,
      drivers: backupData.drivers.length
    })

    return backupData
  } catch (error) {
    logger.error('❌ Erreur sauvegarde critique', { error: error.message })
    return null
  }
}

export default {
  connectDatabase,
  disconnectDatabase,
  checkDatabaseConnection,
  getDatabaseStats,
  backupCriticalData
}