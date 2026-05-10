'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowClockwise, Trash, Taxi, Phone, Envelope, MapPin, Clock, CheckCircle, XCircle, HourglassSimple, CaretDown } from '@phosphor-icons/react'

interface Reservation {
  _id: string
  reservationId: string
  status: string
  customer: { name: string; phone: string; email: string }
  trip: { from: string | { address?: string }; to: string | { address?: string }; distance: number }
  pricing: { totalPrice: number; fourchette?: { de: number; a: number }; tariffType: string; isForfait: boolean }
  passengers: number
  luggage: number
  notes: string
  pickupDate: string
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: HourglassSimple },
  confirmee: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  terminee: { label: 'Terminée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  annulee: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState({ total: 0, en_attente: 0, confirmee: 0, terminee: 0, annulee: 0 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const token = () => sessionStorage.getItem('admin_token') || ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/reservations?${params}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const json = await res.json()
      if (json.success) {
        setReservations(json.data)
        setStats(json.stats)
      }
    } catch { }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/reservations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id, status })
    })
    load()
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`Supprimer ${selected.size} réservation(s) ?`)) return
    await fetch('/api/admin/reservations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ids: [...selected] })
    })
    setSelected(new Set())
    load()
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === reservations.length) setSelected(new Set())
    else setSelected(new Set(reservations.map(r => r._id)))
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrix = (r: Reservation) => {
    if (r.pricing.fourchette?.de && r.pricing.fourchette?.a) {
      return `${r.pricing.fourchette.de.toFixed(2)}€ à ${r.pricing.fourchette.a.toFixed(2)}€`
    }
    return `${r.pricing.totalPrice.toFixed(2)}€`
  }

  const isPast = (d: string) => new Date(d) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Taxi size={28} weight="bold" />
          Réservations
        </h1>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">
          <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', count: stats.total, color: 'text-slate-900' },
          { label: 'En attente', count: stats.en_attente, color: 'text-yellow-700' },
          { label: 'Confirmées', count: stats.confirmee, color: 'text-blue-700' },
          { label: 'Terminées', count: stats.terminee, color: 'text-green-700' },
          { label: 'Annulées', count: stats.annulee, color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-center">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
        {['all', 'en_attente', 'confirmee', 'terminee', 'annulee'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}>
            {s === 'all' ? 'Toutes' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
        {selected.size > 0 && (
          <button onClick={deleteSelected}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
            <Trash size={16} />
            Supprimer ({selected.size})
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Aucune réservation</div>
        ) : (
          reservations.map(r => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.en_attente
            const expanded = expandedId === r._id
            return (
              <div key={r._id} className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${selected.has(r._id) ? 'ring-2 ring-blue-400' : ''}`}>
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : r._id)}>
                  <input type="checkbox" checked={selected.has(r._id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(r._id) }}
                    className="rounded border-slate-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{r.reservationId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                      {r.pricing.isForfait && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Forfait</span>}
                      {isPast(r.pickupDate) && r.status === 'en_attente' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Passée</span>}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      <span className="font-medium">{r.customer.name}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <Clock size={14} className="inline" /> {formatDate(r.pickupDate)}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5 truncate">
                      <MapPin size={14} className="inline text-green-500" /> {(typeof r.trip.from === 'string' ? r.trip.from : r.trip.from?.address || '').split(',')[0]}
                      <span className="mx-1">→</span>
                      <MapPin size={14} className="inline text-red-500" /> {(typeof r.trip.to === 'string' ? r.trip.to : r.trip.to?.address || '').split(',')[0]}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-green-700">{formatPrix(r)}</div>
                    <div className="text-xs text-slate-400">{r.trip.distance?.toFixed(1)} km</div>
                  </div>
                  <CaretDown size={20} className={`text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                </div>

                {expanded && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400 block text-xs">Téléphone</span>
                        <a href={`tel:${r.customer.phone}`} className="text-blue-600 font-medium flex items-center gap-1">
                          <Phone size={14} /> {r.customer.phone}
                        </a>
                      </div>
                      {r.customer.email && (
                        <div>
                          <span className="text-slate-400 block text-xs">Email</span>
                          <a href={`mailto:${r.customer.email}`} className="text-blue-600 font-medium flex items-center gap-1">
                            <Envelope size={14} /> {r.customer.email}
                          </a>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block text-xs">Passagers / Bagages</span>
                        <span className="text-slate-800 font-medium">{r.passengers} pass. / {r.luggage} bag.</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Tarif</span>
                        <span className="text-slate-800 font-medium">{r.pricing.tariffType}</span>
                      </div>
                    </div>

                    {r.notes && (
                      <div className="text-sm">
                        <span className="text-slate-400 text-xs">Notes :</span>
                        <p className="text-slate-700">{r.notes}</p>
                      </div>
                    )}

                    <div className="text-xs text-slate-400">
                      Départ complet : {typeof r.trip.from === 'string' ? r.trip.from : r.trip.from?.address || ''}
                      <br />Destination complète : {typeof r.trip.to === 'string' ? r.trip.to : r.trip.to?.address || ''}
                      <br />Créée le {formatDate(r.createdAt)}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-200 flex-wrap">
                      {r.status !== 'confirmee' && r.status !== 'terminee' && (
                        <button onClick={() => updateStatus(r._id, 'confirmee')}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                          Confirmer
                        </button>
                      )}
                      {r.status !== 'terminee' && r.status !== 'annulee' && (
                        <button onClick={() => updateStatus(r._id, 'terminee')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">
                          Terminer
                        </button>
                      )}
                      {r.status !== 'annulee' && r.status !== 'terminee' && (
                        <button onClick={() => updateStatus(r._id, 'annulee')}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">
                          Annuler
                        </button>
                      )}
                      {(r.status === 'annulee' || r.status === 'terminee') && (
                        <button onClick={() => updateStatus(r._id, 'en_attente')}
                          className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600">
                          Remettre en attente
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
