'use client'

import { useState } from 'react'
import { Mail, Phone, Calendar, CheckCircle, Loader2, Send } from 'lucide-react'

interface EmailCaptureFormProps {
  estimationId: string | null
  tripFrom: string
  tripTo: string
  price: number
  tariffType: string
  distance: number
  duration: number
}

export default function EmailCaptureForm({
  estimationId,
  tripFrom,
  tripTo,
  price,
  tariffType,
  distance,
  duration,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [dateSouhaitee, setDateSouhaitee] = useState('')
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
          dateSouhaitee: dateSouhaitee || null,
          estimationId,
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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-green-700 font-semibold mb-1">
          <CheckCircle className="w-5 h-5" />
          Devis envoyé !
        </div>
        <p className="text-sm text-green-600">
          Vérifiez votre boîte mail (et vos spams).
          Vous pouvez aussi nous joindre directement sur WhatsApp ou par téléphone pour réserver tout de suite.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input
            type="email"
            placeholder="votre@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => {
              if (!expanded) {
                setExpanded(true)
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'email_devis_form_opened', {
                    event_category: 'lead',
                  })
                }
              }
            }}
            className="w-full pl-9 pr-3 py-2.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
          />
        </div>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Recevoir ce devis par email
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Téléphone optionnel */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <input
              type="tel"
              placeholder="Téléphone (optionnel)"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Date souhaitée optionnelle */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <input
              type="date"
              value={dateSouhaitee}
              onChange={(e) => setDateSouhaitee(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-9 pr-3 py-2.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">Date souhaitée</span>
          </div>

          {/* Honeypot (caché) */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
          />

          {/* RGPD */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rgpdConsent}
              onChange={(e) => setRgpdConsent(e.target.checked)}
              className="mt-0.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-600">
              J'accepte d'être recontacté par Taxi Bordeaux Solution concernant ma demande
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!emailValid || !rgpdConsent || loading || !estimationId}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer le devis
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-400 leading-tight">
            Vos données sont utilisées uniquement pour traiter votre demande de transport.
            Conservation 3 ans. Vous pouvez demander leur suppression à contact@taxibordeauxsolution.fr.{' '}
            <a href="/mentions-legales" className="underline hover:text-gray-500">Mentions légales</a>
          </p>
        </div>
      )}
    </div>
  )
}
