'use client'

import { useState, FormEvent } from 'react'
import { Car, MapPin, Clock, Phone, Mail, User, Calendar, MessageSquare, CheckCircle, AlertCircle, Zap } from 'lucide-react'

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    serviceType: 'Transfert Aéroport',
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')
    
    const requiredFields = ['firstName', 'lastName', 'phone', 'departureAddress', 'destination']
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '')
    
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
        setStatusMessage('🎉 Votre réservation a été envoyée avec succès ! Nous vous recontacterons dans les 5 minutes.')
        
        // Reset formulaire
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          serviceType: 'Transfert Aéroport',
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
      setStatusMessage(`❌ Erreur: ${error.message}. Appelez-nous au 📞 06 67 23 78 22`)
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
            <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3 text-green-400 font-semibold">
              <Zap size={20} className="animate-pulse" />
              <span>Prise en charge en 5-10 minutes</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Réservez votre Taxi
              </span>
              <br />
              <span className="text-yellow-400">à Bordeaux</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed font-light">
              Service professionnel 24h/24 • Tarifs réglementés • Prise en charge garantie
            </p>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-6 py-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">5-10min</div>
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
            {!showForm ? (
              <div className="space-y-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 hover:scale-105 inline-flex items-center gap-4"
                >
                  <Car size={32} className="group-hover:scale-110 transition-transform" />
                  <span>RÉSERVER MAINTENANT</span>
                </button>
                
                <div className="flex items-center justify-center gap-6">
                  <a
                    href="tel:0667237822"
                    className="group flex items-center gap-3 text-white hover:text-green-400 transition-colors font-semibold"
                  >
                    <Phone size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>06 67 23 78 22</span>
                  </a>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Appel immédiat</span>
                </div>
              </div>
            ) : (
              <div className="text-left">
                <button
                  onClick={() => setShowForm(false)}
                  className="mb-6 text-slate-400 hover:text-white transition-colors"
                >
                  ← Retour
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire de Réservation */}
      {showForm && (
        <div className="relative pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Status Messages */}
              {status === 'success' && (
                <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4">
                  <CheckCircle className="text-green-600 shrink-0" size={32} />
                  <div>
                    <h4 className="text-lg font-bold text-green-800 mb-1">Réservation Envoyée !</h4>
                    <p className="text-green-700">{statusMessage}</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
                  <AlertCircle className="text-red-600 shrink-0" size={32} />
                  <div>
                    <h4 className="text-lg font-bold text-red-800 mb-1">Erreur</h4>
                    <p className="text-red-700">{statusMessage}</p>
                  </div>
                </div>
              )}
              
              {/* Formulaire */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">Réservation Taxi Bordeaux</h2>
                  <p className="text-blue-100">Remplissez vos informations pour une prise en charge rapide</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  
                  {/* Informations personnelles */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <User className="text-blue-600" size={24} />
                      Vos informations
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-4 text-gray-400" size={20} />
                          <input 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-gray-400">(optionnel)</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-4 text-gray-400" size={20} />
                          <input 
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de service *
                      </label>
                      <select 
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                        required
                      >
                        <option value="Transfert Aéroport">🛫 Transfert Aéroport Mérignac</option>
                        <option value="Transport Gare">🚄 Transport Gare Saint-Jean</option>
                        <option value="Transport Urbain">🏙️ Transport Urbain Bordeaux</option>
                        <option value="Longue Distance">🛣️ Longue Distance</option>
                        <option value="Transport Médical">🏥 Transport Médical</option>
                        <option value="Événement/Mariage">💒 Événement/Mariage</option>
                        <option value="Transport Professionnel">💼 Transport Professionnel</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse de départ *
                        </label>
                        <input 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Destination *
                        </label>
                        <input 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date souhaitée
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-4 text-gray-400" size={20} />
                          <input 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heure souhaitée
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-4 text-gray-400" size={20} />
                          <input 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de passagers
                        </label>
                        <select 
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bagages
                        </label>
                        <select 
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Informations complémentaires
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
                        <textarea 
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
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-green-500/25 hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Car size={24} />
                          CONFIRMER MA RÉSERVATION
                        </>
                      )}
                    </button>

                    <div className="mt-6 text-center space-y-3">
                      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Zap className="text-green-500" size={16} />
                          Réponse sous 5 min
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}