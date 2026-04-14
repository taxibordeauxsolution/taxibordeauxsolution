'use client'

import { useEffect, useState } from 'react'
import { FloppyDisk, ArrowClockwise } from '@phosphor-icons/react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

interface Prix {
  priseEnCharge: number
  tarifKmJour: number
  tarifKmNuit: number
  fraisApproche: number
  courseMini: number
  heureDebutNuit: string
  heureFinNuit: string
}

const DEFAULTS: Prix = {
  priseEnCharge: 2.83,
  tarifKmJour: 2.16,
  tarifKmNuit: 3.24,
  fraisApproche: 7.20,
  courseMini: 28.00,
  heureDebutNuit: '19:00',
  heureFinNuit: '06:00',
}

export default function AdminPrix() {
  const [prix, setPrix] = useState<Prix>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const token = () => sessionStorage.getItem('admin_token') || ''

  useEffect(() => {
    fetch(`${API}/admin/prix`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setPrix(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const set = (k: keyof Prix, v: string) => {
    setPrix(prev => ({ ...prev, [k]: ['heureDebutNuit', 'heureFinNuit'].includes(k) ? v : parseFloat(v) || 0 }))
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`${API}/admin/prix`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(prix)
      })
      const data = await res.json()
      setMessage(data.success ? { type: 'ok', text: 'Prix sauvegardés !' } : { type: 'err', text: 'Erreur lors de la sauvegarde' })
    } catch {
      setMessage({ type: 'err', text: 'Erreur de connexion' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <ArrowClockwise size={32} className="animate-spin text-blue-600" />
    </div>
  )

  const Field = ({ label, k, unit, step = '0.01', type = 'number' }: {
    label: string; k: keyof Prix; unit?: string; step?: string; type?: string
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          step={step}
          min={type === 'number' ? '0' : undefined}
          value={prix[k]}
          onChange={e => set(k, e.target.value)}
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium"
        />
        {unit && <span className="text-gray-500 text-sm font-medium w-10">{unit}</span>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prix de base</h1>
        <p className="text-gray-500 text-sm mt-1">Tarifs kilométriques officiels appliqués aux estimations</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Tarifs kilométriques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Prise en charge" k="priseEnCharge" unit="€" />
          <Field label="Tarif km — Jour" k="tarifKmJour" unit="€/km" />
          <Field label="Tarif km — Nuit" k="tarifKmNuit" unit="€/km" />
          <Field label="Frais d'approche" k="fraisApproche" unit="€" />
          <Field label="Course minimum" k="courseMini" unit="€" />
        </div>

        <h2 className="font-bold text-gray-800 text-lg border-b pb-3 pt-2">Heures tarif nuit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Début nuit (ex: 19:00)" k="heureDebutNuit" type="time" step="60" />
          <Field label="Fin nuit (ex: 06:00)" k="heureFinNuit" type="time" step="60" />
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl px-5 py-3 font-semibold text-sm ${
          message.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-8 py-3 rounded-2xl transition-colors shadow-lg"
        >
          <FloppyDisk size={20} />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
