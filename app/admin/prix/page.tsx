'use client'

import { useEffect, useState } from 'react'
import { FloppyDisk, ArrowClockwise, Tag, CalendarX, Trash, Plus } from '@phosphor-icons/react'
import { getToken } from '@/app/admin/lib/token'
import { useToast } from '@/app/admin/components/Toast'

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
    suppApprocheActive: false,
    suppApprocheSeuilKm: 50,
    itineraireCourt: true,
    tarifNuitDegressifActive: false,
    tarifNuitDegressifSeuilKm: 30,
    tarifNuitDegressifPrixKm: 2.50,
    tarifNuitDegressifMode: 'degressif' as string,
    tarifJourDegressifActive: false,
    tarifJourDegressifSeuilKm: 30,
    tarifJourDegressifPrixKm: 1.80,
    tarifJourDegressifMode: 'degressif' as string,
    seuilKmCaptureLead: 25,
    captureLeadActive: true,
    affichagePrixUnique: false,
    joursOff: [] as string[],
  })
  const [newJourOff, setNewJourOff] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const token = getToken()
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
    const token = getToken()
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
        toast(`Erreur ${res.status} : ${data.message || text.slice(0, 120)}`, 'error')
      } else {
        toast('Prix sauvegardés !', 'success')
      }
    } catch (e: any) {
      toast(`Erreur réseau : ${e.message}`, 'error')
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Prix de base</h1>
        <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Tarifs kilométriques appliqués aux estimations</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg border-b border-gray-200 dark:border-slate-700 pb-3">Tarifs kilométriques</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Prise en charge</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.priseEnCharge}
                onChange={e => setNum('priseEnCharge', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Tarif km — Jour</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.tarifKmJour}
                onChange={e => setNum('tarifKmJour', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€/km</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Tarif km — Nuit</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.tarifKmNuit}
                onChange={e => setNum('tarifKmNuit', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€/km</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">{"Frais d'approche"}</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.fraisApproche}
                onChange={e => setNum('fraisApproche', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Course minimum — de</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.courseMiniDe}
                onChange={e => setNum('courseMiniDe', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€</span>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Course minimum — à</label>
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" min="0"
                value={prix.courseMini}
                onChange={e => setNum('courseMini', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€</span>
            </div>
          </div>
        </div>

        <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg border-b border-gray-200 dark:border-slate-700 pb-3 pt-2">Heures tarif nuit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Début nuit</label>
            <input type="time" step="60"
              value={prix.heureDebutNuit}
              onChange={e => setStr('heureDebutNuit', e.target.value)}
              className="w-full border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Fin nuit</label>
            <input type="time" step="60"
              value={prix.heureFinNuit}
              onChange={e => setStr('heureFinNuit', e.target.value)}
              className="w-full border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
          </div>
        </div>
      </div>

      {/* Tarif nuit dégressif */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
          <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg">Tarif nuit dégressif</h2>
          <button
            type="button"
            role="switch" aria-checked={prix.tarifNuitDegressifActive} aria-label="Tarif nuit dégressif"
            onClick={() => setPrix(prev => ({ ...prev, tarifNuitDegressifActive: !prev.tarifNuitDegressifActive }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              prix.tarifNuitDegressifActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              prix.tarifNuitDegressifActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${prix.tarifNuitDegressifActive ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Mode de calcul</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPrix(prev => ({ ...prev, tarifNuitDegressifMode: 'degressif' }))}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                    prix.tarifNuitDegressifMode === 'degressif'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className={`font-bold text-sm ${prix.tarifNuitDegressifMode === 'degressif' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                    Dégressif
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Seuls les km au-delà du seuil passent au tarif réduit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPrix(prev => ({ ...prev, tarifNuitDegressifMode: 'retroactif' }))}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                    prix.tarifNuitDegressifMode === 'retroactif'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className={`font-bold text-sm ${prix.tarifNuitDegressifMode === 'retroactif' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                    Rétroactif
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Toute la course passe au tarif réduit dès le seuil dépassé</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">À partir de</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="1" min="5"
                    value={prix.tarifNuitDegressifSeuilKm}
                    onChange={e => setNum('tarifNuitDegressifSeuilKm', e.target.value)}
                    className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
                  <span className="text-gray-500 dark:text-slate-400 text-sm w-10">km</span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Prix km nuit réduit</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" min="0"
                    value={prix.tarifNuitDegressifPrixKm}
                    onChange={e => setNum('tarifNuitDegressifPrixKm', e.target.value)}
                    className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
                  <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€/km</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Au lieu de {prix.tarifKmNuit}€/km normal</p>
              </div>
            </div>
          </div>
        </div>
        {!prix.tarifNuitDegressifActive && <p className="text-gray-600 dark:text-slate-400 text-sm">Activez pour appliquer un tarif nuit réduit au-delà d{"'"}un certain nombre de km.</p>}
      </div>

      {/* Tarif jour dégressif */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
          <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg">Tarif jour dégressif</h2>
          <button
            type="button"
            role="switch" aria-checked={prix.tarifJourDegressifActive} aria-label="Tarif jour dégressif"
            onClick={() => setPrix(prev => ({ ...prev, tarifJourDegressifActive: !prev.tarifJourDegressifActive }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              prix.tarifJourDegressifActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              prix.tarifJourDegressifActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${prix.tarifJourDegressifActive ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Mode de calcul</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPrix(prev => ({ ...prev, tarifJourDegressifMode: 'degressif' }))}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                    prix.tarifJourDegressifMode === 'degressif'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className={`font-bold text-sm ${prix.tarifJourDegressifMode === 'degressif' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                    Dégressif
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Seuls les km au-delà du seuil passent au tarif réduit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPrix(prev => ({ ...prev, tarifJourDegressifMode: 'retroactif' }))}
                  className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                    prix.tarifJourDegressifMode === 'retroactif'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className={`font-bold text-sm ${prix.tarifJourDegressifMode === 'retroactif' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                    Rétroactif
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Toute la course passe au tarif réduit dès le seuil dépassé</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">À partir de</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="1" min="5"
                    value={prix.tarifJourDegressifSeuilKm}
                    onChange={e => setNum('tarifJourDegressifSeuilKm', e.target.value)}
                    className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
                  <span className="text-gray-500 dark:text-slate-400 text-sm w-10">km</span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Prix km jour réduit</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" min="0"
                    value={prix.tarifJourDegressifPrixKm}
                    onChange={e => setNum('tarifJourDegressifPrixKm', e.target.value)}
                    className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium text-gray-900" />
                  <span className="text-gray-500 dark:text-slate-400 text-sm w-10">€/km</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Au lieu de {prix.tarifKmJour}€/km normal</p>
              </div>
            </div>
          </div>
        </div>
        {!prix.tarifJourDegressifActive && <p className="text-gray-600 dark:text-slate-400 text-sm">Activez pour appliquer un tarif jour réduit au-delà d{"'"}un certain nombre de km.</p>}
      </div>

      {/* Remise courses longues */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
          <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg flex items-center gap-2">
            <Tag size={20} className="text-green-600" />
            Remise courses longues
          </h2>
          <button
            type="button"
            role="switch" aria-checked={prix.remiseActive} aria-label="Remise courses longues"
            onClick={() => setPrix(prev => ({ ...prev, remiseActive: !prev.remiseActive }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              prix.remiseActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              prix.remiseActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${prix.remiseActive ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Seuil de distance</label>
              <div className="flex items-center gap-2">
                <input type="number" step="1" min="10"
                  value={prix.remiseSeuilKm}
                  onChange={e => setNum('remiseSeuilKm', e.target.value)}
                  className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-green-500 focus:outline-none font-medium text-gray-900" />
                <span className="text-gray-500 dark:text-slate-400 text-sm w-10">km</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">La remise s{"'"}applique au-delà de cette distance</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Pourcentage de remise</label>
              <div className="flex gap-2">
                {[5, 10, 15].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPrix(prev => ({ ...prev, remisePourcentage: pct }))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                      prix.remisePourcentage === pct
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {!prix.remiseActive && <p className="text-gray-600 dark:text-slate-400 text-sm">Activez la remise pour proposer un prix réduit sur les courses longues distance.</p>}
      </div>

      {/* Suppression frais d'approche */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
          <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg">Offrir les frais d{"'"}approche</h2>
          <button
            type="button"
            role="switch" aria-checked={prix.suppApprocheActive} aria-label="Offrir frais d'approche"
            onClick={() => setPrix(prev => ({ ...prev, suppApprocheActive: !prev.suppApprocheActive }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              prix.suppApprocheActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              prix.suppApprocheActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${prix.suppApprocheActive ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">À partir de</label>
            <div className="flex items-center gap-2 max-w-xs">
              <input type="number" step="1" min="10"
                value={prix.suppApprocheSeuilKm}
                onChange={e => setNum('suppApprocheSeuilKm', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-green-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">km</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Les {prix.fraisApproche}€ de frais d{"'"}approche seront offerts au-delà de cette distance</p>
          </div>
        </div>
        {!prix.suppApprocheActive && <p className="text-gray-600 dark:text-slate-400 text-sm">Activez pour supprimer les frais d{"'"}approche ({prix.fraisApproche}€) sur les longues distances.</p>}
      </div>

      {/* Mode itinéraire */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
          <div>
            <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg">Mode itinéraire</h2>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">Détermine le calcul de distance pour les estimations</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPrix(prev => ({ ...prev, itineraireCourt: true }))}
            className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
              prix.itineraireCourt
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-300 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
            }`}
          >
            <div className={`font-bold text-sm ${prix.itineraireCourt ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
              Plus court
            </div>
            <p className="text-xs text-gray-500 mt-1">Évite les autoroutes, passe par la ville. Moins de km = prix plus bas.</p>
          </button>
          <button
            type="button"
            onClick={() => setPrix(prev => ({ ...prev, itineraireCourt: false }))}
            className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
              !prix.itineraireCourt
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-300 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
            }`}
          >
            <div className={`font-bold text-sm ${!prix.itineraireCourt ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
              Plus rapide
            </div>
            <p className="text-xs text-gray-500 mt-1">Autoroutes et rocade incluses. Plus de km mais trajet plus rapide.</p>
          </button>
        </div>
      </div>

      {/* Affichage prix : fourchette ou prix unique */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-8 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
          <div>
            <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg flex items-center gap-2">
              <Tag size={20} className="text-green-600" />
              Affichage du prix
            </h2>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {prix.affichagePrixUnique
                ? 'Prix unique affiché (haut de fourchette inclus frais d\'approche) — plus clair, plus engageant'
                : 'Fourchette affichée (ex: 30€ à 35€) — montre la possibilité de payer moins'}
            </p>
          </div>
          <button
            type="button"
            role="switch" aria-checked={prix.affichagePrixUnique} aria-label="Affichage prix unique"
            onClick={() => setPrix(prev => ({ ...prev, affichagePrixUnique: !prev.affichagePrixUnique }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${
              prix.affichagePrixUnique ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              prix.affichagePrixUnique ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Capture lead longue distance */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
          <div>
            <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg flex items-center gap-2">
              <Tag size={20} className="text-purple-600" />
              Capture lead longue distance
            </h2>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              {prix.captureLeadActive
                ? 'Module 5 étapes : le client laisse ses coordonnées avant de voir le prix'
                : 'Module 4 étapes classique : le client voit le prix directement'}
            </p>
          </div>
          <button
            type="button"
            role="switch" aria-checked={prix.captureLeadActive} aria-label="Capture lead longue distance"
            onClick={() => setPrix(prev => ({ ...prev, captureLeadActive: !prev.captureLeadActive }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${
              prix.captureLeadActive ? 'bg-purple-500' : 'bg-gray-300 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              prix.captureLeadActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {prix.captureLeadActive ? (
          <div className="max-w-xs">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Seuil km capture lead</label>
            <div className="flex items-center gap-2">
              <input type="number" step="1" min="1"
                value={prix.seuilKmCaptureLead}
                onChange={e => setNum('seuilKmCaptureLead', e.target.value)}
                className="flex-1 border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-purple-500 focus:outline-none font-medium text-gray-900" />
              <span className="text-gray-500 dark:text-slate-400 text-sm w-10">km</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Au-delà de cette distance, le client doit laisser ses coordonnées avant de voir le prix</p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-slate-400 text-sm">Désactivé — le client voit directement le prix et peut réserver en 4 étapes sans laisser ses coordonnées au préalable.</p>
        )}
      </div>

      {/* Jours de repos */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-8 space-y-5 sm:space-y-6">
        <div className="border-b border-gray-200 dark:border-slate-700 pb-3">
          <h2 className="font-bold text-gray-800 dark:text-slate-200 text-base sm:text-lg flex items-center gap-2">
            <CalendarX size={20} className="text-red-500" />
            Jours de repos
          </h2>
          <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Bloquez les jours où vous ne travaillez pas. Les clients ne pourront pas réserver ces dates.</p>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-400 mb-1">Ajouter une date</label>
            <input
              type="date"
              value={newJourOff}
              onChange={e => setNewJourOff(e.target.value)}
              min={new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })}
              className="w-full border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:border-red-500 focus:outline-none font-medium text-gray-900"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (newJourOff && !prix.joursOff.includes(newJourOff)) {
                setPrix(prev => ({ ...prev, joursOff: [...prev.joursOff, newJourOff].sort() }))
                setNewJourOff('')
              }
            }}
            disabled={!newJourOff}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 transition-colors"
          >
            <Plus size={16} />
            Bloquer
          </button>
        </div>

        {prix.joursOff.length > 0 ? (
          <div className="space-y-2">
            {prix.joursOff.map(jour => {
              const d = new Date(jour + 'T12:00:00')
              const label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
              const isPast = jour < new Date().toISOString().split('T')[0]
              return (
                <div key={jour} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${isPast ? 'bg-gray-50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 opacity-60' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'}`}>
                  <span className={`text-sm font-medium capitalize ${isPast ? 'text-gray-500 dark:text-slate-400' : 'text-red-800 dark:text-red-300'}`}>{label}</span>
                  <button
                    type="button"
                    onClick={() => setPrix(prev => ({ ...prev, joursOff: prev.joursOff.filter(j => j !== jour) }))}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-400 hover:text-red-600"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-slate-400 text-sm">Aucun jour bloqué — les clients peuvent réserver tous les jours.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 sm:px-8 py-3 rounded-2xl transition-colors shadow-lg text-sm sm:text-base">
          <FloppyDisk size={20} />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
