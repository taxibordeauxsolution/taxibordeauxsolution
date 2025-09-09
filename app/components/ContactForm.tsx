'use client'

import { useState, FormEvent } from 'react'
import { MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContactForm() {
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
    message: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    // 🔍 DEBUG: Afficher les données avant envoi
    console.log('📤 Données formulaire:', formData)
    
    // 🔍 VALIDATION CÔTÉ CLIENT
    const requiredFields = ['firstName', 'lastName', 'phone', 'departureAddress', 'destination']
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '')
    
    if (missingFields.length > 0) {
      console.log('❌ Champs manquants côté client:', missingFields)
      setStatus('error')
      setStatusMessage(`❌ Veuillez remplir les champs obligatoires : ${missingFields.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      console.log('📤 Envoi vers API Resend...', formData)
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('📬 Réponse API:', response.status, response)
      
      const result = await response.json()
      console.log('📄 Contenu réponse:', result)

      if (response.ok) {
        setStatus('success')
        setStatusMessage('🎉 Votre demande a été envoyée avec succès ! Nous vous recontacterons dans les plus brefs délais.')
        
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
          message: ''
        })

        setTimeout(() => setStatus('idle'), 5000)
      } else {
        throw new Error(result.error || 'Erreur envoi')
      }
    } catch (error) {
      console.error('❌ Erreur serveur:', error instanceof Error ? error.message : error)
      setStatus('error')
      setStatusMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Appelez-nous au 📞 06 67 23 78 22`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`🔄 Champ modifié: ${name} = "${value}"`) // Debug
    
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <div className="bg-gray-50 p-8 rounded-2xl">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Demande de Réservation
        </h3>
        <p className="text-gray-600">
          Remplissez ce formulaire pour une réponse rapide sous 2h
        </p>
      </div>
      
      {/* 🔍 DEBUG: Afficher l'état du formulaire */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
        <strong>DEBUG:</strong> {JSON.stringify(formData, null, 2)}
      </div>
      
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600 shrink-0" size={24} />
          <p className="text-green-800">{statusMessage}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={24} />
          <p className="text-red-800">{statusMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom/Prénom */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom * <span className="text-red-500">({formData.firstName ? '✓' : '❌'})</span>
            </label>
            <input 
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Votre prénom"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom * <span className="text-red-500">({formData.lastName ? '✓' : '❌'})</span>
            </label>
            <input 
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Votre nom"
              required
            />
          </div>
        </div>

        {/* Téléphone/Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone * <span className="text-red-500">({formData.phone ? '✓' : '❌'})</span>
            </label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="06 12 34 56 78"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-gray-400">(optionnel)</span>
            </label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="votre@email.fr"
            />
          </div>
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de Service *
          </label>
          <select 
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            <option value="Transfert Aéroport">🛫 Transfert Aéroport Mérignac</option>
            <option value="Transport Gare">🚄 Transport Gare Saint-Jean</option>
            <option value="Transport Urbain">🏙️ Transport Urbain Bordeaux</option>
            <option value="Longue Distance">🛣️ Longue Distance</option>
            <option value="Transport Médical">🏥 Transport Médical</option>
            <option value="Événement/Mariage">💒 Événement/Mariage</option>
            <option value="Transport Professionnel">💼 Transport Professionnel</option>
            <option value="Autre">❓ Autre (préciser)</option>
          </select>
        </div>

        {/* Trajets */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse de départ * <span className="text-red-500">({formData.departureAddress ? '✓' : '❌'})</span>
            </label>
            <input 
              type="text"
              name="departureAddress"
              value={formData.departureAddress}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Place de la Comédie, Bordeaux"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination * <span className="text-red-500">({formData.destination ? '✓' : '❌'})</span>
            </label>
            <input 
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Aéroport Bordeaux-Mérignac"
              required
            />
          </div>
        </div>

        {/* Date/Heure */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date souhaitée
            </label>
            <input 
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure souhaitée
            </label>
            <input 
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations complémentaires
          </label>
          <textarea 
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Bagages, nombre de passagers, demandes spéciales..."
          />
        </div>

        {/* Submit */}
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              <MessageCircle size={24} />
              Envoyer ma Demande
            </>
          )}
        </button>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">* Champs obligatoires</p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>⏰ Réponse sous 2h</span>
            <span>📞 Service 24h/24</span>
            <span>💳 Paiement CB/Espèces</span>
          </div>
        </div>
      </form>
    </div>
  )
}