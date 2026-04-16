'use client'

import { useState, FormEvent } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setStatusMessage('Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.')
        setFormData({ firstName: '', lastName: '', phone: '', email: '', message: '' })
        setTimeout(() => setStatus('idle'), 6000)
      } else {
        throw new Error(result.error || 'Erreur envoi')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage(`Une erreur est survenue. Appelez-nous directement au 06 67 23 78 22`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">Nous contacter</h3>
        <p className="text-gray-500 text-sm">Réponse garantie sous 2h</p>
      </div>

      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600 shrink-0" size={20} />
          <p className="text-green-800 text-sm">{statusMessage}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-red-800 text-sm">{statusMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cf-firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input
              id="cf-firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Jean"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label htmlFor="cf-lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              id="cf-lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Dupont"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cf-phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
            <input
              id="cf-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="06 12 34 56 78"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label htmlFor="cf-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="cf-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean@email.fr"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cf-message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            id="cf-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Votre message..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" role="status" aria-label="Envoi en cours" />
          ) : (
            <>
              <Send size={18} />
              Envoyer le message
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">* Champs obligatoires</p>
      </form>
    </div>
  )
}
