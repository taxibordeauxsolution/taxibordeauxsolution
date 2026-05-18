'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowClockwise, Trash, Phone, Envelope, MapPin, Clock, CheckCircle, CaretDown, CaretLeft, CaretRight, MagnifyingGlass, PhoneCall } from '@phosphor-icons/react'

interface Lead {
  _id: string
  reservationId: string
  status: string
  customer: { name: string; phone: string; email: string }
  trip: { from: string | { address?: string }; to: string | { address?: string }; distance: number }
  pricing: { totalPrice: number; fourchette?: { de: number; a: number }; tariffType: string; isForfait: boolean }
  passengers: number
  luggage: number
  pickupDate: string
  createdAt: string
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState({ total: 0, lead_capture: 0 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const token = () => sessionStorage.getItem('admin_token') || ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', 'lead_capture')
      params.set('page', String(page))
      params.set('limit', '20')
      const res = await fetch(`/api/admin/reservations?${params}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const json = await res.json()
      if (json.success) {
        setLeads(json.data)
        setStats({ total: json.pagination?.total || 0, lead_capture: json.stats?.lead_capture || 0 })
        setTotalPages(json.pagination?.totalPages || 1)
      }
    } catch { }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [load])

  const convertToResa = async (id: string) => {
    await fetch('/api/admin/reservations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id, status: 'en_attente' })
    })
    load()
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`Supprimer ${selected.size} lead(s) ?`)) return
    await fetch('/api/admin/reservations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ids: [...selected] })
    })
    setSelected(new Set())
    load()
  }

  const deleteSingle = async (id: string) => {
    if (!confirm('Supprimer ce lead ?')) return
    await fetch('/api/admin/reservations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ids: [id] })
    })
    load()
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrix = (r: Lead) => {
    if (r.pricing.fourchette?.de && r.pricing.fourchette?.a) {
      return `${r.pricing.fourchette.de.toFixed(2)}€ à ${r.pricing.fourchette.a.toFixed(2)}€`
    }
    return `${r.pricing.totalPrice.toFixed(2)}€`
  }

  const filtered = leads.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.customer.name.toLowerCase().includes(q) ||
      r.customer.phone.includes(q) ||
      r.reservationId.toLowerCase().includes(q) ||
      (r.customer.email && r.customer.email.toLowerCase().includes(q))
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PhoneCall size={24} weight="bold" className="text-purple-600 shrink-0" />
          Leads à rappeler
        </h1>
        <button onClick={load} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors shrink-0">
          <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 sm:p-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-purple-600 font-medium">Leads en attente de rappel</div>
          <div className="text-3xl font-bold text-purple-800">{stats.lead_capture}</div>
        </div>
        <PhoneCall size={40} className="text-purple-300" />
      </div>

      {/* Recherche */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>
        {selected.size > 0 && (
          <div className="flex">
            <button onClick={deleteSelected}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
              <Trash size={16} />
              Supprimer ({selected.size})
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {search ? 'Aucun résultat' : 'Aucun lead en attente'}
          </div>
        ) : (
          filtered.map(r => {
            const expanded = expandedId === r._id
            return (
              <div key={r._id} className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${selected.has(r._id) ? 'ring-2 ring-purple-400' : ''}`}>
                <div className="p-3 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : r._id)}>
                  <input type="checkbox" checked={selected.has(r._id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(r._id) }}
                    className="rounded border-slate-300 shrink-0 mt-1 sm:mt-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{r.customer.name}</span>
                      <a href={`tel:${r.customer.phone}`} className="text-purple-600 font-semibold text-sm flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Phone size={14} /> {r.customer.phone}
                      </a>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                      <MapPin size={14} className="inline text-green-500" /> {(typeof r.trip.from === 'string' ? r.trip.from : r.trip.from?.address || '').split(',')[0]}
                      <span className="mx-1">→</span>
                      <MapPin size={14} className="inline text-red-500" /> {(typeof r.trip.to === 'string' ? r.trip.to : r.trip.to?.address || '').split(',')[0]}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{r.trip.distance?.toFixed(1)} km</span>
                      <span><Clock size={12} className="inline" /> {formatDate(r.pickupDate)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="text-lg font-bold text-green-700">{formatPrix(r)}</div>
                    <div className="text-xs text-slate-400">Reçu {new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <CaretDown size={20} className={`text-slate-400 transition-transform shrink-0 hidden sm:block ${expanded ? 'rotate-180' : ''}`} />
                </div>

                {expanded && (
                  <div className="border-t border-slate-100 p-3 sm:p-4 bg-slate-50 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400 block text-xs">Téléphone</span>
                        <a href={`tel:${r.customer.phone}`} className="text-purple-600 font-medium flex items-center gap-1">
                          <Phone size={14} /> {r.customer.phone}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Email</span>
                        {r.customer.email ? (
                          <a href={`mailto:${r.customer.email}`} className="text-blue-600 font-medium flex items-center gap-1 truncate">
                            <Envelope size={14} className="shrink-0" /> <span className="truncate">{r.customer.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">Non renseigné</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Passagers / Bagages</span>
                        <span className="text-slate-800 font-medium">{r.passengers} pass. / {r.luggage} bag.</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Prix estimé</span>
                        <span className="text-green-700 font-bold">{formatPrix(r)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 break-words">
                      Départ : {typeof r.trip.from === 'string' ? r.trip.from : r.trip.from?.address || ''}
                      <br />Destination : {typeof r.trip.to === 'string' ? r.trip.to : r.trip.to?.address || ''}
                      <br />Date souhaitée : {formatDate(r.pickupDate)}
                      <br />Lead reçu le {formatDate(r.createdAt)}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button onClick={() => convertToResa(r._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5">
                        <CheckCircle size={14} />
                        Convertir en réservation
                      </button>
                      <button onClick={() => deleteSingle(r._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-sm text-slate-600 px-3">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
