'use client'

import { useEffect, useState } from 'react'
import { FloppyDisk, ArrowClockwise, Tag } from '@phosphor-icons/react'

export default function AdminPrix() {
  const [prix, setPrix] = useState({
    priseEnCharge: 2.83,
    tarifKmJour: 2.16,
    tarifKmNuit: 3.24,
    fraisApproche: 7.20,
    courseMini: 28.00,
    courseMiniDe: 20.00,
    heureDebutNuit: '19:00',
    heureFinNuit: '06:00',
    remiseActive: false,
    remiseSeuilKm: 50,
    remisePourcentage: 10,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token') || ''
    fetch('/api/admin/prix', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setPrix(prev => ({ ...prev, ...d.data })) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setNum = (k: string, v: string) =>
    setPrix(prev => ({ ...prev, [k]: v === '' ? '' : parseFloat(v) } as any))

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
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { /* réponse non-JSON */ }
      if (!res.ok || !data.success) {
        setMessage({ type: 'err', text: `Erreur ${res.status} : ${data.message || text.slice(0, 120)}` })
      } else {
        setMessage({ type: 'ok', text: 'Prix sauvegardés !' })
      }
    } catch (e: any) {
      setMessage({ type: 'err', text: `Erreur réseau : ${e.message}` })
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Prix de base</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Tarifs kilométriques appliqués aux estimations</p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <h2 className="font-bold text-gray-800 text-base sm:text-lg border-b pb-3">Tarifs kilométriques</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Prise en charge</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.priseEnCharge}
                onChange={e => setNum('priseEnCharge', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Tarif km — Jour</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.tarifKmJour}
                onChange={e => setNum('tarifKmJour', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 text-sm w-10">€/km</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Tarif km — Nuit</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.tarifKmNuit}
                onChange={e => setNum('tarifKmNuit', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 text-sm w-10">€/km</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">{"Frais d'approche"}</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.fraisApproche}
                onChange={e => setNum('fraisApproche', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Course minimum — de</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.courseMiniDe}
                onChange={e => setNum('courseMiniDe', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Course minimum — à</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.courseMini}
                onChange={e => setNum('courseMini', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 text-sm w-10">€</span>
            </div>
          </div>
        </div>

        <h2 className="font-bold text-gray-800 text-base sm:text-lg border-b pb-3 pt-2">Heures tarif nuit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Début nuit</label>
            <input type="time" step="60"
              value={prix.heureDebutNuit}
              onChange={e => setStr('heureDebutNuit', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Fin nuit</label>
            <input type="time" step="60"
              value={prix.heureFinNuit}
              onChange={e => setStr('heureFinNuit', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none font-medium text-gray-900" />
          </div>
        </div>
      </div>

      {/* Remise courses longues */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-bold text-gray-800 text-base sm:text-lg flex items-center gap-2">
            <Tag size={20} className="text-green-600" />
            Remise courses longues
          </h2>
          <button
            type="button"
            onClick={() => setPrix(prev => ({ ...prev, remiseActive: !prev.remiseActive }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              prix.remiseActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              prix.remiseActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {prix.remiseActive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Seuil de distance</label>
              <div className="flex items-center gap-2">
                <input type="number" step="1" min="10"
                  value={prix.remiseSeuilKm}
                  onChange={e => setNum('remiseSeuilKm', e.target.value)}
                  className="flex-1 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-green-500 focus:outline-none font-medium text-gray-900" />
                <span className="text-gray-500 text-sm w-10">km</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">La remise s{"'"}applique au-delà de cette distance</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Pourcentage de remise</label>
              <div className="flex gap-2">
                {[5, 10, 15].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPrix(prev => ({ ...prev, remisePourcentage: pct }))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                      prix.remisePourcentage === pct
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!prix.remiseActive && (
          <p className="text-gray-400 text-sm">Activez la remise pour proposer un prix réduit sur les courses longues distance.</p>
        )}
      </div>

      {message && (
        <div className={`rounded-2xl px-4 sm:px-5 py-3 font-semibold text-sm ${
          message.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-6 sm:px-8 py-3 rounded-2xl transition-colors shadow-lg text-sm sm:text-base">
          <FloppyDisk size={20} />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
