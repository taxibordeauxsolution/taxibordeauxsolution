'use client'

import { useState, FormEvent } from 'react'
import { Car, MapPin, Clock, Phone, Mail, User, Calendar, MessageSquare, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface ReservationFormProps {
  context?: 'airport' | 'station' | 'general'
  defaultService?: string
}

export default function ReservationForm({ context = 'general', defaultService }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceType: defaultService || 'Transfert Aéroport',
    departureAddress: '',
    destination: '',
    date: '',
    time: '',
    passengers: '1',
    luggage: '0',
    message: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Configuration du contenu selon le contexte
  const getContextContent = () => {
    switch (context) {
      case 'airport':
        return {
          title: 'Réservez votre Taxi Aéroport',
          subtitle: 'Service depuis/vers Bordeaux-Mérignac • Station taxi officielle',
          description: 'Prise en charge à la station taxi Hall A ou réservation pour vos départs',
          badgeText: 'Station officielle aéroport',
          serviceMessage: 'Le taxi vous attend à l\'emplacement taxi de l\'aéroport'
        }
      case 'station':
        return {
          title: 'Réservez votre Taxi Gare',
          subtitle: 'Service depuis/vers Gare Saint-Jean • Accès direct',
          description: 'Prise en charge devant la gare ou réservation pour vos départs en train',
          badgeText: 'Service gare prioritaire',
          serviceMessage: 'Prise en charge devant la gare'
        }
      default:
        return {
          title: 'Réservez votre Taxi à Bordeaux',
          subtitle: 'Service professionnel 24h/24 • Tarifs réglementés • Prise en charge garantie',
          description: 'Service professionnel 24h/24 • Tarifs réglementés • Prise en charge garantie',
          badgeText: 'Prise en charge rapide',
          serviceMessage: 'Nous vous retrouvons où vous voulez'
        }
    }
  }

  const contextContent = getContextContent()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')
    
    const requiredFields = ['firstName', 'lastName', 'phone', 'departureAddress', 'destination']
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '')
    
    if (missingFields.length > 0) {
      setStatus('error')
      setStatusMessage(`Veuillez remplir les champs obligatoires : ${missingFields.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setStatusMessage('🎉 Votre réservation a été envoyée avec succès ! Nous vous recontacterons rapidement.')
        
        // Reset formulaire
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          serviceType: defaultService || 'Transfert Aéroport',
          departureAddress: '',
          destination: '',
          date: '',
          time: '',
          passengers: '1',
          luggage: '0',
          message: ''
        })

        setTimeout(() => {
          setStatus('idle')
          setShowForm(false)
        }, 5000)
      } else {
        throw new Error(result.error || 'Erreur envoi')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Appelez-nous au 📞 06 67 23 78 22`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      
      {/* Hero Section avec CTA */}
      <div className="relative pt-20 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center text-white space-y-8 max-w-4xl mx-auto">
            
            {/* Badge de rapidité */}
            <motion.div 
              className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3 text-green-400 font-semibold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap size={20} />
              </motion.div>
              <span>{contextContent.badgeText}</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                {contextContent.title}
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-slate-300 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
{contextContent.subtitle}
            </motion.p>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-6 py-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">Rapide</div>
                <div className="text-sm text-slate-400">Prise en charge</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">24/7</div>
                <div className="text-sm text-slate-400">Disponibilité</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">100%</div>
                <div className="text-sm text-slate-400">Fiabilité</div>
              </div>
            </div>

            {/* CTA Principal */}
            <AnimatePresence mode="wait">
              {!showForm ? (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <motion.button
                    onClick={() => setShowForm(true)}
                    className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 inline-flex items-center gap-4"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Car size={32} />
                    </motion.div>
                    <span>RÉSERVER MAINTENANT</span>
                  </motion.button>
                
                  <motion.div 
                    className="flex items-center justify-center gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <motion.a
                      href="tel:0667237822"
                      className="group flex items-center gap-3 text-white hover:text-green-400 transition-colors font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 12 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Phone size={20} />
                      </motion.div>
                      <span>06 67 23 78 22</span>
                    </motion.a>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">Appel immédiat</span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  className="text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.button
                    onClick={() => setShowForm(false)}
                    className="mb-6 text-slate-400 hover:text-white transition-colors"
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Retour
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Formulaire de Réservation */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="relative pb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
              
                {/* Status Messages */}
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div 
                      className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4"
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle className="text-green-600 shrink-0" size={32} />
                      </motion.div>
                      <div>
                        <h4 className="text-lg font-bold text-green-800 mb-1">Réservation Envoyée !</h4>
                        <p className="text-green-700">{statusMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div 
                      className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4"
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                      >
                        <AlertCircle className="text-red-600 shrink-0" size={32} />
                      </motion.div>
                      <div>
                        <h4 className="text-lg font-bold text-red-800 mb-1">Erreur</h4>
                        <p className="text-red-700">{statusMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              
                {/* Formulaire */}
                <motion.div 
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h2 className="text-3xl font-bold mb-2">Réservation Taxi Bordeaux</h2>
                    <p className="text-blue-100">Remplissez vos informations pour une prise en charge rapide</p>
                  </motion.div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  
                  {/* Informations personnelles */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <User className="text-blue-600" size={24} />
                      Vos informations
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="rf-firstName" className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                        <input
                          id="rf-firstName"
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="Votre prénom"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="rf-lastName" className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                        <input
                          id="rf-lastName"
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="rf-phone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-4 text-gray-400" size={20} aria-hidden="true" />
                          <input
                            id="rf-phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                            placeholder="06 12 34 56 78"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="rf-email" className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-gray-400">(optionnel)</span></label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-4 text-gray-400" size={20} aria-hidden="true" />
                          <input
                            id="rf-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                            placeholder="votre@email.fr"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service et trajet */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <MapPin className="text-green-600" size={24} />
                      Votre trajet
                    </h3>
                    
                    <div>
                      <label htmlFor="rf-serviceType" className="block text-sm font-medium text-gray-700 mb-2">Type de service *</label>
                      <select
                        id="rf-serviceType"
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                        required
                      >
                        {context === 'airport' ? (
                          <>
                            <option value="Arrivée Aéroport">🛬 Arrivée Aéroport (Station Taxi Hall A)</option>
                            <option value="Départ vers Aéroport">🛫 Départ vers Aéroport Mérignac</option>
                            <option value="Transfert Aéroport">✈️ Transfert Aéroport (Aller-Retour)</option>
                          </>
                        ) : context === 'station' ? (
                          <>
                            <option value="Arrivée Gare">🚂 Arrivée Gare Saint-Jean</option>
                            <option value="Départ vers Gare">🚄 Départ vers Gare Saint-Jean</option>
                            <option value="Transport Gare">🚉 Transfert Gare</option>
                          </>
                        ) : (
                          <>
                            <option value="Transfert Aéroport">🛫 Transfert Aéroport Mérignac</option>
                            <option value="Transport Gare">🚄 Transport Gare Saint-Jean</option>
                            <option value="Transport Urbain">🏙️ Transport Urbain Bordeaux</option>
                            <option value="Longue Distance">🛣️ Longue Distance</option>
                            <option value="Transport Médical">🏥 Transport Médical</option>
                            <option value="Événement/Mariage">💒 Événement/Mariage</option>
                            <option value="Transport Professionnel">💼 Transport Professionnel</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="rf-departure" className="block text-sm font-medium text-gray-700 mb-2">Adresse de départ *</label>
                        <input
                          id="rf-departure"
                          type="text"
                          name="departureAddress"
                          value={formData.departureAddress}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="Ex: Place de la Comédie, Bordeaux"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="rf-destination" className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
                        <input
                          id="rf-destination"
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="Ex: Aéroport Bordeaux-Mérignac"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Détails de réservation */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <Clock className="text-purple-600" size={24} />
                      Détails de réservation
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="rf-date" className="block text-sm font-medium text-gray-700 mb-2">Date souhaitée</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-4 text-gray-400" size={20} aria-hidden="true" />
                          <input
                            id="rf-date"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="rf-time" className="block text-sm font-medium text-gray-700 mb-2">Heure souhaitée</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-4 text-gray-400" size={20} aria-hidden="true" />
                          <input
                            id="rf-time"
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="rf-passengers" className="block text-sm font-medium text-gray-700 mb-2">Nombre de passagers</label>
                        <select
                          id="rf-passengers"
                          name="passengers"
                          value={formData.passengers}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                        >
                          <option value="1">1 passager</option>
                          <option value="2">2 passagers</option>
                          <option value="3">3 passagers</option>
                          <option value="4">4 passagers</option>
                          <option value="5">5 passagers</option>
                          <option value="6">6 passagers ou plus</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="rf-luggage" className="block text-sm font-medium text-gray-700 mb-2">Bagages</label>
                        <select
                          id="rf-luggage"
                          name="luggage"
                          value={formData.luggage}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                        >
                          <option value="0">Pas de bagages</option>
                          <option value="1">1 bagage</option>
                          <option value="2">2 bagages</option>
                          <option value="3">3 bagages</option>
                          <option value="4">4 bagages ou plus</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="rf-message" className="block text-sm font-medium text-gray-700 mb-2">Informations complémentaires</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-4 text-gray-400" size={20} aria-hidden="true" />
                        <textarea
                          id="rf-message"
                          rows={4}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-lg"
                          placeholder="Demandes spéciales, siège bébé, accessibilité..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bouton de soumission */}
                  <div className="pt-8 border-t border-gray-200">
                    <motion.button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-green-500/25"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" role="status" aria-label="Envoi en cours"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Car size={24} />
                          CONFIRMER MA RÉSERVATION
                        </>
                      )}
                    </motion.button>

                    {/* Message spécifique selon le contexte */}
                    {context === 'airport' && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-blue-800 text-sm font-medium text-center">
                          ✈️ {contextContent.serviceMessage}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 text-center space-y-3">
                      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Zap className="text-green-500" size={16} />
                          Réponse rapide
                        </span>
                        <span className="flex items-center gap-2">
                          <Phone className="text-blue-500" size={16} />
                          Service 24h/24
                        </span>
                        <span className="flex items-center gap-2">
                          <CheckCircle className="text-purple-500" size={16} />
                          Tarifs réglementés
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        * Champs obligatoires - Vos données sont sécurisées et ne seront jamais partagées
                      </p>
                    </div>
                  </div>
                </form>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}