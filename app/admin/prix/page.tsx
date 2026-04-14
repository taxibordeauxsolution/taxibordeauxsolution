'use client'

import { useEffect, useState } from 'react'
import { FloppyDisk, ArrowClockwise } from '@phosphor-icons/react'

export default function AdminPrix() {
  const [prix, setPrix] = useState({
    priseEnCharge: 2.83,
    tarifKmJour: 2.16,
    tarifKmNuit: 3.24,
    fraisApproche: 7.20,
    courseMini: 28.00,
    heureDebutNuit: '19:00',
    heureFinNuit: '06:00',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token') || ''
    fetch('/api/admin/prix', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setPrix(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setNum = (k: string, v: string) =>
    setPrix(prev => ({ ...prev, [k]: parseFloat(v) || 0 }))

  const setStr = (k: string, v: string) =>
    setPrix(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const token = sessionStorage.getItem('admin_token') || ''
    try {
      const res = await fetch('/api/admin/prix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(prix)
      })
      const data = await res.json()
      setMessage(data.success
        ? { type: 'ok', text: 'Prix sauvegardés !' }
        : { type: 'err', text: 'Erreur lors de la sauvegarde' })
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prix de base</h1>
        <p className="text-gray-500 text-sm mt-1">Tarifs kilométriques appliqués aux estimations</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="font-bold text-gray-800 text-lg border-b pb-3">Tarifs kilométriques</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prise en charge</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.priseEnCharge}
                onChange={e => setNum('priseEnCharge', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium" />
              <span className="text-gray-500 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tarif km — Jour</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.tarifKmJour}
                onChange={e => setNum('tarifKmJour', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium" />
              <span className="text-gray-500 text-sm w-10">€/km</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tarif km — Nuit</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.tarifKmNuit}
                onChange={e => setNum('tarifKmNuit', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium" />
              <span className="text-gray-500 text-sm w-10">€/km</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{"Frais d'approche"}</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.fraisApproche}
                onChange={e => setNum('fraisApproche', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium" />
              <span className="text-gray-500 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Course minimum</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.courseMini}
                onChange={e => setNum('courseMini', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium" />
              <span className="text-gray-500 text-sm w-10">€</span>
            </div>
          </div>
        </div>

        <h2 className="font-bold text-gray-800 text-lg border-b pb-3 pt-2">Heures tarif nuit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Début nuit</label>
            <input type="time" step="60"
              value={prix.heureDebutNuit}
              onChange={e => setStr('heureDebutNuit', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fin nuit</label>
            <input type="time" step="60"
              value={prix.heureFinNuit}
              onChange={e => setStr('heureFinNuit', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none font-medium" />
          </div>
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
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-8 py-3 rounded-2xl transition-colors shadow-lg">
          <FloppyDisk size={20} />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
