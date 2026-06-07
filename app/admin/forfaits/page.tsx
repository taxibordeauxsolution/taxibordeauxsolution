'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Plus, PencilSimple, Trash, ToggleLeft, ToggleRight, ArrowClockwise, MapPin } from '@phosphor-icons/react'
import { getToken } from '@/app/admin/lib/token'
import { ConfirmDialog } from '@/app/admin/components/ConfirmDialog'
import type { Forfait } from './ForfaitForm'

const API = '/api'
const EMPTY_POINT = { adresse: '', lat: 0, lng: 0, zone: [] }
const EMPTY: Forfait = { nom: '', pointA: EMPTY_POINT, pointB: EMPTY_POINT, prixJour: 0, prixNuit: 0, actif: true }

const ForfaitForm = dynamic(() => import('./ForfaitForm'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col items-center gap-3">
        <ArrowClockwise size={32} className="animate-spin text-blue-600" />
        <span className="text-sm text-slate-500 dark:text-slate-400">Chargement de la carte…</span>
      </div>
    </div>
  ),
})

export default function AdminForfaits() {
  const [forfaits, setForfaits] = useState<Forfait[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Forfait | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<{ id: string; nom: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/forfaits`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (data.success) setForfaits(data.data)
    } catch (e) { console.error('Erreur chargement forfaits:', e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleActif = async (f: Forfait) => {
    await fetch(`${API}/admin/forfaits/${f._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ actif: !f.actif })
    })
    load()
  }

  const deleteForfait = async (id: string) => {
    setDeleting(id)
    await fetch(`${API}/admin/forfaits/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
    setDeleting(null)
    load()
  }

  const onSaved = () => { setEditing(null); load() }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <ArrowClockwise size={32} className="animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      {confirmDel && (
        <ConfirmDialog
          message={`Supprimer le forfait "${confirmDel.nom}" ?`}
          onConfirm={() => { const { id } = confirmDel; setConfirmDel(null); deleteForfait(id) }}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Forfaits</h1>
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Prix fixes pour des trajets spécifiques</p>
        </div>
        <button onClick={() => setEditing(EMPTY)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl transition-colors shadow-lg text-sm sm:text-base shrink-0">
          <Plus size={20} />
          <span className="hidden sm:inline">Nouveau forfait</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {message && (
        <div className={`rounded-2xl px-5 py-3 font-semibold text-sm ${message.type === 'ok' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      {forfaits.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center text-gray-600 dark:text-slate-500">
          Aucun forfait. Créez-en un !
        </div>
      ) : (
        <div className="space-y-3">
          {forfaits.map(f => (
            <div key={f._id} className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border ${f.actif ? 'border-gray-100 dark:border-slate-700' : 'border-gray-300 dark:border-slate-700 opacity-60'} p-4 sm:p-5`}>
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{f.nom}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {f.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 space-y-0.5 sm:space-y-0">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin size={14} className="shrink-0 text-green-500" />
                      <span className="truncate">{f.pointA.adresse}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin size={14} className="shrink-0 text-red-500" />
                      <span className="truncate">{f.pointB.adresse}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <button onClick={() => toggleActif(f)} className="p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" title="Activer/Désactiver">
                    {f.actif ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} className="text-gray-600" />}
                  </button>
                  <button onClick={() => setEditing(f)} className="p-1.5 sm:p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors" title="Modifier">
                    <PencilSimple size={18} />
                  </button>
                  <button onClick={() => setConfirmDel({ id: f._id!, nom: f.nom })} disabled={deleting === f._id}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors" title="Supprimer">
                    {deleting === f._id ? <ArrowClockwise size={18} className="animate-spin" /> : <Trash size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 text-sm">
                <span className="font-semibold text-blue-700 dark:text-blue-400">Jour : {f.prixJour} €</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-400">Nuit : {f.prixNuit} €</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ForfaitForm
          initial={editing}
          token={getToken()}
          onSaved={onSaved}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}
