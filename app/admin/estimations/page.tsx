'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowClockwise, DownloadSimple, ChartBar, MapPin, CurrencyEur, Path, Trash, CaretLeft, CaretRight, EnvelopeSimple, ChatCircleDots, WhatsappLogo, CalendarBlank } from '@phosphor-icons/react'

interface Estimation {
  _id: string
  from: string
  to: string
  distance: number
  duration: number
  price: number
  fourchette?: { de: number; a: number }
  tariffType: string
  isForfait: boolean
  departureDate?: string
  createdAt: string
  email?: string | null
  telephone?: string | null
  dateSouhaitee?: string | null
  statut?: string
  notes?: string | null
  leadCreatedAt?: string | null
  utmSource?: string | null
}

interface Stats {
  total: number
  avgPrice: number
  topRoutes: { route: string; count: number }[]
  forfaitCount: number
  leadCount: number
}

export default function AdminEstimations() {
  const [estimations, setEstimations] = useState<Estimation[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, avgPrice: 0, topRoutes: [], forfaitCount: 0, leadCount: 0 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [leadsOnly, setLeadsOnly] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(today)

  const token = () => sessionStorage.getItem('admin_token') || ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      params.set('page', String(page))
      params.set('limit', '30')
      if (leadsOnly) params.set('leadsOnly', 'true')
      const res = await fetch(`/api/admin/estimations?${params}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const json = await res.json()
      if (json.success) {
        setEstimations(json.data)
        setStats(json.stats)
        setTotalPages(json.pagination?.totalPages || 1)
      }
    } catch { }
    setLoading(false)
  }, [dateFrom, dateTo, page, leadsOnly])

  useEffect(() => { load() }, [load])

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const truncate = (s: string, n = 30) => s && s.length > n ? s.slice(0, n) + '...' : s

  const tariffColor = (t: string) => {
    switch (t) {
      case 'Nuit': return 'bg-blue-100 text-blue-800'
      case 'Férié': return 'bg-red-100 text-red-800'
      case 'Dimanche': return 'bg-purple-100 text-purple-800'
      case 'Mixte': return 'bg-orange-100 text-orange-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === estimations.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(estimations.map(e => e._id)))
    }
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`Supprimer ${selected.size} estimation(s) ?`)) return
    try {
      await fetch('/api/admin/estimations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ids: [...selected] })
      })
      setSelected(new Set())
      load()
    } catch { }
  }

  const updateStatut = async (id: string, statut: string) => {
    try {
      await fetch('/api/admin/estimations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ id, statut })
      })
      setEstimations(prev => prev.map(e => e._id === id ? { ...e, statut } : e))
    } catch { }
  }

  const saveNotes = async (id: string) => {
    try {
      await fetch('/api/admin/estimations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ id, notes: notesValue })
      })
      setEstimations(prev => prev.map(e => e._id === id ? { ...e, notes: notesValue } : e))
      setEditingNotes(null)
    } catch { }
  }

  const statutLabels: Record<string, { label: string; color: string }> = {
    estimation_seule: { label: 'Estimation', color: 'bg-gray-100 text-gray-600' },
    lead: { label: 'Lead', color: 'bg-green-100 text-green-700' },
    contacte: { label: 'Contacté', color: 'bg-blue-100 text-blue-700' },
    converti: { label: 'Converti', color: 'bg-emerald-100 text-emerald-700' },
    perdu: { label: 'Perdu', color: 'bg-red-100 text-red-700' },
  }

  const exportCSV = () => {
    const header = 'Date,Départ,Destination,Distance (km),Durée (min),Prix,Fourchette,Tarif,Forfait,Email,Téléphone,Statut\n'
    const rows = estimations.map(e => {
      const fourchette = e.fourchette ? `${e.fourchette.de.toFixed(2)} - ${e.fourchette.a.toFixed(2)}` : '-'
      return `"${formatDate(e.createdAt)}","${e.from}","${e.to}",${e.distance.toFixed(1)},${e.duration},"${e.price.toFixed(2)}€","${fourchette}",${e.tariffType},${e.isForfait ? 'Oui' : 'Non'},"${e.email || ''}","${e.telephone || ''}","${e.statut || 'estimation_seule'}"`
    }).join('\n')
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estimations_${dateFrom}_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ChartBar size={28} weight="bold" />
          Estimations clients
        </h1>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-300 transition-colors">
          <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500">Total estimations</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500">Prix moyen</div>
          <div className="text-2xl font-bold text-green-700">{stats.avgPrice.toFixed(2)}€</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500">Forfaits</div>
          <div className="text-2xl font-bold text-blue-700">{stats.forfaitCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500">Taux forfait</div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.total > 0 ? ((stats.forfaitCount / stats.total) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-200">
          <div className="text-sm text-slate-500 flex items-center gap-1">
            <EnvelopeSimple size={14} className="text-green-600" />
            Leads avec email
          </div>
          <div className="text-2xl font-bold text-green-700">
            {stats.leadCount} <span className="text-sm font-normal text-slate-400">/ {stats.total}</span>
          </div>
        </div>
      </div>

      {/* Top routes */}
      {stats.topRoutes.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Path size={16} />
            Top trajets
          </h3>
          <div className="space-y-2">
            {stats.topRoutes.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 truncate flex-1">{r.route}</span>
                <span className="text-slate-500 font-semibold ml-4">{r.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Du</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Au</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <button onClick={() => { setPage(1); load() }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Filtrer
        </button>
        <button onClick={() => { const t = new Date().toISOString().split('T')[0]; setDateFrom(t); setDateTo(t); setPage(1) }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${dateFrom === dateTo && dateFrom === new Date().toISOString().split('T')[0] ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          <CalendarBlank size={16} />
          Aujourd'hui
        </button>
        <button onClick={() => { setLeadsOnly(!leadsOnly); setPage(1) }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${leadsOnly ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          <EnvelopeSimple size={16} />
          {leadsOnly ? 'Leads uniquement ✓' : 'Leads uniquement'}
        </button>
        <button onClick={exportCSV}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2">
          <DownloadSimple size={16} />
          Export CSV
        </button>
        {selected.size > 0 && (
          <button onClick={deleteSelected}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
            <Trash size={16} />
            Supprimer ({selected.size})
          </button>
        )}
      </div>

      {/* Liste : cartes mobile / tableau desktop */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Chargement...</div>
      ) : estimations.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Aucune estimation sur cette période</div>
      ) : (
        <>
          {/* Cartes mobile */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center gap-3 px-1">
              <input type="checkbox" checked={estimations.length > 0 && selected.size === estimations.length}
                onChange={toggleAll} className="rounded border-slate-300" />
              <span className="text-xs text-slate-500">Tout sélectionner</span>
            </div>
            {estimations.map(e => (
              <div key={e._id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-colors ${selected.has(e._id) ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selected.has(e._id)}
                      onChange={() => toggleSelect(e._id)} className="rounded border-slate-300" />
                    <span className="text-xs text-slate-400">{formatDate(e.createdAt)}</span>
                    {e.utmSource && <span className="text-[10px] text-indigo-500 font-medium">{e.utmSource}</span>}
                    {e.departureDate && (
                      <span className="text-[10px] text-blue-500 ml-1">Dep: {formatDate(e.departureDate)}</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tariffColor(e.tariffType)}`}>
                    {e.tariffType}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-green-600 mt-0.5 shrink-0" />
                    <span className="text-slate-800">{e.from}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <span className="text-slate-800">{e.to}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{e.distance.toFixed(1)} km</span>
                  <div className="text-right">
                    <span className="font-bold text-green-700">{e.price.toFixed(2)}€</span>
                    {e.fourchette && (
                      <div className="text-xs text-slate-400">{e.fourchette.de.toFixed(2)}€ - {e.fourchette.a.toFixed(2)}€</div>
                    )}
                  </div>
                </div>
                {e.email && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <EnvelopeSimple size={12} className="text-green-600" />
                      <a href={`mailto:${e.email}`} className="text-blue-600 hover:underline text-xs truncate">{e.email}</a>
                    </div>
                    {e.telephone && (
                      <div className="flex items-center gap-2">
                        <a href={`tel:${e.telephone}`} className="text-blue-600 hover:underline text-xs">{e.telephone}</a>
                        <a
                          href={`https://wa.me/${e.telephone.replace(/\D/g, '').replace(/^0/, '33')}?text=${encodeURIComponent(`Bonjour, suite à votre estimation ${e.from.split(',')[0]} → ${e.to.split(',')[0]} (${e.price.toFixed(2)}€), je reviens vers vous.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-green-600"
                        >
                          <WhatsappLogo size={14} weight="fill" />
                        </a>
                      </div>
                    )}
                    <select
                      value={e.statut || 'lead'}
                      onChange={ev => updateStatut(e._id, ev.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${statutLabels[e.statut || 'lead']?.color || 'bg-gray-100 text-gray-600'}`}
                    >
                      <option value="lead">Lead</option>
                      <option value="contacte">Contacté</option>
                      <option value="converti">Converti</option>
                      <option value="perdu">Perdu</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tableau desktop */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={estimations.length > 0 && selected.size === estimations.length}
                      onChange={toggleAll} className="rounded border-slate-300" />
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Estimation</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Départ prévu</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Départ</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Destination</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">Dist.</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">Prix</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">Fourchette</th>
                  <th className="text-center px-4 py-3 text-slate-600 font-semibold">Tarif</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Email / Tél</th>
                  <th className="text-center px-4 py-3 text-slate-600 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {estimations.map(e => (
                  <tr key={e._id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selected.has(e._id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(e._id)}
                        onChange={() => toggleSelect(e._id)} className="rounded border-slate-300" />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(e.createdAt)}
                      {e.utmSource && <div className="text-[10px] text-indigo-500 font-medium">{e.utmSource}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {e.departureDate ? formatDate(e.departureDate) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-800" title={e.from}>{truncate(e.from)}</td>
                    <td className="px-4 py-3 text-slate-800" title={e.to}>{truncate(e.to)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{e.distance.toFixed(1)} km</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{e.price.toFixed(2)}€</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {e.fourchette ? `${e.fourchette.de.toFixed(2)}€ - ${e.fourchette.a.toFixed(2)}€` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tariffColor(e.tariffType)}`}>
                        {e.tariffType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      {e.email ? (
                        <div className="space-y-1">
                          <a href={`mailto:${e.email}`} className="text-blue-600 hover:underline text-xs block truncate max-w-[160px]" title={e.email}>{e.email}</a>
                          {e.telephone && (
                            <div className="flex items-center gap-1">
                              <a href={`tel:${e.telephone}`} className="text-blue-600 hover:underline text-xs">{e.telephone}</a>
                              <a
                                href={`https://wa.me/${e.telephone.replace(/\D/g, '').replace(/^0/, '33')}?text=${encodeURIComponent(`Bonjour, suite à votre estimation ${e.from.split(',')[0]} → ${e.to.split(',')[0]} (${e.price.toFixed(2)}€), je reviens vers vous.`)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700" title="Répondre par WhatsApp"
                              >
                                <WhatsappLogo size={14} weight="fill" />
                              </a>
                            </div>
                          )}
                          {e.dateSouhaitee && (
                            <div className="text-[10px] text-slate-400">Souhaité : {new Date(e.dateSouhaitee).toLocaleDateString('fr-FR')}</div>
                          )}
                          {/* Notes */}
                          {editingNotes === e._id ? (
                            <div className="flex gap-1">
                              <input
                                type="text" value={notesValue}
                                onChange={ev => setNotesValue(ev.target.value)}
                                onKeyDown={ev => ev.key === 'Enter' && saveNotes(e._id)}
                                className="text-xs px-1.5 py-0.5 border border-slate-300 rounded w-full"
                                autoFocus
                              />
                              <button onClick={() => saveNotes(e._id)} className="text-xs text-blue-600 font-semibold whitespace-nowrap">OK</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingNotes(e._id); setNotesValue(e.notes || '') }}
                              className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                            >
                              <ChatCircleDots size={10} />
                              {e.notes ? truncate(e.notes, 20) : 'Ajouter note'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {e.email ? (
                        <select
                          value={e.statut || 'lead'}
                          onChange={ev => updateStatut(e._id, ev.target.value)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${statutLabels[e.statut || 'lead']?.color || 'bg-gray-100 text-gray-600'}`}
                        >
                          <option value="lead">Lead</option>
                          <option value="contacte">Contacté</option>
                          <option value="converti">Converti</option>
                          <option value="perdu">Perdu</option>
                        </select>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <CaretLeft size={16} />
          </button>
          <span className="text-sm text-slate-600 px-3">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
