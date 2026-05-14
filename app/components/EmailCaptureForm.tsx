'use client'

import { useState } from 'react'
import { Mail, Phone, CheckCircle, Loader2, Send, ChevronUp } from 'lucide-react'

interface EmailCaptureFormProps {
  estimationId: string | null
  tripFrom: string
  tripTo: string
  price: number
  tariffType: string
  distance: number
  duration: number
  departureDate: string
  departureTime: string
  passengers: number
  isForfait: boolean
}

export default function EmailCaptureForm({
  estimationId,
  tripFrom,
  tripTo,
  price,
  tariffType,
  distance,
  duration,
  departureDate,
  departureTime,
  passengers,
  isForfait,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [rgpdConsent, setRgpdConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async () => {
    if (!emailValid || !rgpdConsent || !estimationId) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/devis-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          telephone: telephone || null,
          dateSouhaitee: departureDate && departureTime ? `${departureDate}T${departureTime}` : null,
          estimationId,
          passengers,
          isForfait,
          rgpdConsent,
          honeypot,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Erreur lors de l\'envoi')
        setLoading(false)
        return
      }

      setSent(true)

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'email_devis_submitted', {
          event_category: 'lead',
          price_ttc: price,
          trajet: `${tripFrom.split(',')[0]} → ${tripTo.split(',')[0]}`,
          estimation_id: estimationId,
        })
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-green-600 py-1">
        <CheckCircle className="w-4 h-4 inline mr-1" />
        Devis envoyé — vérifiez votre boîte mail
      </p>
    )
  }

  if (!expanded) {
    return (
      <button
        onClick={() => {
          setExpanded(true)
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'email_devis_form_opened', {
              event_category: 'lead',
            })
          }
        }}
        className="w-full text-center text-sm text-gray-500 hover:text-blue-600 transition-colors py-2"
      >
        <Mail className="w-3.5 h-3.5 inline mr-1" />
        Recevoir ce devis par email
      </button>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">Recevoir ce devis par email</span>
        <button
          onClick={() => setExpanded(false)}
          className="text-gray-300 hover:text-gray-500 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="email"
            placeholder="votre@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-gray-900 placeholder-gray-300"
            autoFocus
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="tel"
            placeholder="Téléphone (optionnel)"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 text-gray-900 placeholder-gray-300"
          />
        </div>

        {/* Honeypot */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
        />

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rgpdConsent}
            onChange={(e) => setRgpdConsent(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-[11px] text-gray-400 leading-tight">
            J'accepte d'être recontacté par Taxi Bordeaux Solution concernant ma demande.{' '}
            <a href="/mentions-legales" className="underline hover:text-gray-500">Mentions légales</a>
          </span>
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!emailValid || !rgpdConsent || loading || !estimationId}
          className="w-full py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Envoi...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Envoyer
            </>
          )}
        </button>
      </div>
    </div>
  )
}
