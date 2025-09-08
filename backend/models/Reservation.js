/**
 * MODÈLE RÉSERVATION MONGO DB
 * Modèle complet avec validation et index pour performance
 */

import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const { Schema, model } = mongoose

/**
 * Schéma pour les coordonnées GPS
 */
const CoordinatesSchema = new Schema({
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  }
}, { _id: false })

/**
 * Schéma pour les informations de trajet
 */
const TripSchema = new Schema({
  from: {
    address: {
      type: String,
      required: true,
      maxlength: 500
    },
    coordinates: {
      type: CoordinatesSchema,
      required: true,
      index: '2dsphere'
    },
    placeId: {
      type: String,
      maxlength: 200
    }
  },
  to: {
    address: {
      type: String,
      required: true,
      maxlength: 500
    },
    coordinates: {
      type: CoordinatesSchema,
      required: true,
      index: '2dsphere'
    },
    placeId: {
      type: String,
      maxlength: 200
    }
  },
  distance: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // Maximum 1000km
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
    max: 720 // Maximum 12 heures
  },
  routeData: {
    overview_polyline: String,
    legs: [{
      distance: {
        text: String,
        value: Number
      },
      duration: {
        text: String,
        value: Number
      },
      steps: Schema.Types.Mixed
    }],
    bounds: {
      northeast: CoordinatesSchema,
      southwest: CoordinatesSchema
    },
    warnings: [String],
    waypoint_order: [Number]
  },
  estimatedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false })

/**
 * Schéma pour les détails de réservation
 */
const BookingSchema = new Schema({
  passengers: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
    default: 1
  },
  luggage: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 0
  },
  isImmediate: {
    type: Boolean,
    default: true
  },
  scheduledDateTime: {
    type: Date,
    validate: {
      validator: function(value) {
        // Si ce n'est pas immédiat, la date est requise
        if (!this.isImmediate && !value) return false
        // La date ne peut pas être dans le passé
        if (value && value < new Date()) return false
        return true
      },
      message: 'Date de réservation invalide'
    }
  },
  notes: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  preferredLanguage: {
    type: String,
    enum: ['fr', 'en', 'es'],
    default: 'fr'
  },
  detectedLanguage: {
    type: String,
    enum: ['fr', 'en', 'es'],
    default: 'fr'
  },
  specialRequests: {
    childSeat: { type: Boolean, default: false },
    wheelchair: { type: Boolean, default: false },
    animal: { type: Boolean, default: false },
    smoking: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: true }
  }
}, { _id: false })

/**
 * Schéma pour les informations client
 */
const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(phone) {
        // Validation numéro français ou international
        const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/
        return phoneRegex.test(phone.replace(/[\s.-]/g, ''))
      },
      message: 'Numéro de téléphone invalide'
    }
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        if (!email) return true // Email optionnel
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      },
      message: 'Adresse email invalide'
    }
  },
  ipAddress: {
    type: String,
    default: ''
  },
  location: {
    country: { type: String, default: 'FR' },
    region: { type: String, default: '' },
    city: { type: String, default: '' },
    coordinates: CoordinatesSchema
  },
  languagePreference: {
    type: String,
    enum: ['fr', 'en', 'es'],
    default: 'fr'
  },
  isReturningCustomer: {
    type: Boolean,
    default: false
  },
  customerNotes: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, { _id: false })

/**
 * Schéma pour le calcul des prix
 */
const PricingSchema = new Schema({
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  kmPrice: {
    type: Number,
    required: true,
    min: 0
  },
  luggageSupplement: {
    type: Number,
    default: 0,
    min: 0
  },
  passengerSupplement: {
    type: Number,
    default: 0,
    min: 0
  },
  nightRate: {
    type: Boolean,
    default: false
  },
  weekendRate: {
    type: Boolean,
    default: false
  },
  holidayRate: {
    type: Boolean,
    default: false
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  locale: {
    type: String,
    default: 'fr-FR'
  },
  calculationDetails: {
    baseFare: Number,
    distanceFare: Number,
    timeFare: Number,
    supplements: [{
      type: String,
      amount: Number,
      description: String
    }],
    discounts: [{
      type: String,
      amount: Number,
      description: String
    }]
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false })

/**
 * Schéma pour les informations chauffeur
 */
const DriverSchema = new Schema({
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'Driver'
  },
  name: {
    type: String,
    maxlength: 100
  },
  phone: {
    type: String,
    maxlength: 20
  },
  vehicleInfo: {
    make: String,
    model: String,
    color: String,
    licensePlate: String,
    type: {
      type: String,
      enum: ['standard', 'premium', 'van', 'luxury']
    }
  },
  spokenLanguages: [{
    type: String,
    enum: ['fr', 'en', 'es']
  }],
  assignedAt: Date,
  estimatedArrival: Date,
  actualArrival: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String
}, { _id: false })

/**
 * Schéma pour les communications
 */
const CommunicationSchema = new Schema({
  type: {
    type: String,
    enum: ['email', 'sms', 'call', 'push', 'webhook'],
    required: true
  },
  language: {
    type: String,
    enum: ['fr', 'en', 'es'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  template: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  recipient: String,
  subject: String,
  content: String,
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  deliveryStatus: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'bounced'],
    default: 'sent'
  },
  openedAt: Date,
  clickedAt: Date
}, { _id: false })

/**
 * Schéma pour l'historique des événements
 */
const EventSchema = new Schema({
  type: {
    type: String,
    enum: [
      'created', 'confirmed', 'assigned', 'driver_assigned', 'driver_arrived',
      'trip_started', 'trip_completed', 'cancelled', 'refunded', 'modified',
      'payment_received', 'rating_received', 'complaint_received'
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  metadata: Schema.Types.Mixed,
  userId: String,
  userType: {
    type: String,
    enum: ['customer', 'driver', 'admin', 'system']
  },
  ipAddress: String,
  userAgent: String
}, { _id: false })

/**
 * Schéma principal de la réservation
 */
const ReservationSchema = new Schema({
  reservationId: {
    type: String,
    unique: true,
    required: true,
    default: () => `TX-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
  },
  
  trip: {
    type: TripSchema,
    required: true
  },
  
  booking: {
    type: BookingSchema,
    required: true
  },
  
  customer: {
    type: CustomerSchema,
    required: true
  },
  
  pricing: {
    type: PricingSchema,
    required: true
  },
  
  driver: DriverSchema,
  
  status: {
    type: String,
    enum: [
      'pending',        // En attente de confirmation
      'confirmed',      // Confirmée
      'assigned',       // Chauffeur assigné
      'driver_arrived', // Chauffeur arrivé
      'in_progress',    // Trajet en cours
      'completed',      // Trajet terminé
      'cancelled',      // Annulée
      'refunded'        // Remboursée
    ],
    default: 'pending',
    index: true
  },
  
  communications: [CommunicationSchema],
  
  events: [EventSchema],
  
  // Informations de paiement
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'app', 'account'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: Number,
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },
  
  // Évaluation et feedback
  rating: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    driver: {
      type: Number,
      min: 1,
      max: 5
    },
    vehicle: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    comfort: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    ratedAt: Date
  },
  
  // Métadonnées techniques
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'phone', 'admin'],
      default: 'web'
    },
    platform: String,
    userAgent: String,
    referrer: String,
    sessionId: String,
    apiVersion: String
  }
}, {
  timestamps: true,
  versionKey: false
})

/**
 * Index composites pour performance
 */
ReservationSchema.index({ status: 1, createdAt: -1 })
ReservationSchema.index({ 'customer.phone': 1, createdAt: -1 })
ReservationSchema.index({ 'booking.scheduledDateTime': 1 })
ReservationSchema.index({ 'trip.from.coordinates': '2dsphere' })
ReservationSchema.index({ 'trip.to.coordinates': '2dsphere' })
ReservationSchema.index({ 'driver.driverId': 1, status: 1 })

/**
 * Méthodes d'instance
 */
ReservationSchema.methods.addEvent = function(type, description, metadata = {}) {
  this.events.push({
    type,
    description,
    metadata,
    timestamp: new Date()
  })
  return this.save()
}

ReservationSchema.methods.addCommunication = function(communication) {
  this.communications.push(communication)
  return this.save()
}

ReservationSchema.methods.updateStatus = function(newStatus, description, metadata = {}) {
  const oldStatus = this.status
  this.status = newStatus
  
  return this.addEvent('status_changed', description || `Status changed from ${oldStatus} to ${newStatus}`, {
    oldStatus,
    newStatus,
    ...metadata
  })
}

ReservationSchema.methods.assignDriver = function(driver) {
  this.driver = {
    driverId: driver._id,
    name: `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
    phone: driver.personalInfo.phone,
    vehicleInfo: driver.vehicle,
    spokenLanguages: driver.personalInfo.spokenLanguages,
    assignedAt: new Date(),
    estimatedArrival: new Date(Date.now() + (this.booking.isImmediate ? 10 : 15) * 60 * 1000)
  }
  
  return this.updateStatus('assigned', `Chauffeur ${this.driver.name} assigné`)
}

/**
 * Méthodes statiques
 */
ReservationSchema.statics.findByPhone = function(phone) {
  return this.find({ 'customer.phone': phone }).sort({ createdAt: -1 })
}

ReservationSchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['pending', 'confirmed', 'assigned', 'in_progress'] }
  }).sort({ createdAt: -1 })
}

ReservationSchema.statics.findByDriver = function(driverId) {
  return this.find({ 'driver.driverId': driverId }).sort({ createdAt: -1 })
}

ReservationSchema.statics.getStats = async function(dateFrom, dateTo) {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          $lte: dateTo || new Date()
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.totalPrice' },
        avgAmount: { $avg: '$pricing.totalPrice' }
      }
    }
  ]
  
  return this.aggregate(pipeline)
}

/**
 * Middleware pre-save
 */
ReservationSchema.pre('save', function(next) {
  // Ajouter un événement de création lors du premier save
  if (this.isNew) {
    this.events.push({
      type: 'created',
      description: 'Réservation créée',
      timestamp: new Date(),
      metadata: {
        source: this.metadata?.source || 'web',
        customerPhone: this.customer.phone
      }
    })
  }
  
  next()
})

/**
 * Middleware post-save
 */
ReservationSchema.post('save', function(doc) {
  // Log pour monitoring
  console.log(`Réservation ${doc.reservationId} sauvegardée avec status: ${doc.status}`)
})

/**
 * Virtuals
 */
ReservationSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat(this.pricing.locale, {
    style: 'currency',
    currency: this.pricing.currency
  }).format(this.pricing.totalPrice)
})

ReservationSchema.virtual('estimatedDuration').get(function() {
  if (this.trip.duration < 60) {
    return `${Math.round(this.trip.duration)} min`
  }
  const hours = Math.floor(this.trip.duration / 60)
  const minutes = Math.round(this.trip.duration % 60)
  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
})

// Permettre la sérialisation des virtuals
ReservationSchema.set('toJSON', { virtuals: true })
ReservationSchema.set('toObject', { virtuals: true })

const Reservation = model('Reservation', ReservationSchema)

export default Reservation