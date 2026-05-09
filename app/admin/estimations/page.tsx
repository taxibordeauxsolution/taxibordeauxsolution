'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowClockwise, DownloadSimple, ChartBar, MapPin, CurrencyEur, Path } from '@phosphor-icons/react'

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
}

interface Stats {
  total: number
  avgPrice: number
  topRoutes: { route: string; count: number }[]
  forfaitCount: number
}

export default function AdminEstimations() {
  const [estimations, setEstimations] = useState<Estimation[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, avgPrice: 0, topRoutes: [], forfaitCount: 0 })
  const [loading, setLoading] = useState(true)

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
      const res = await fetch(`/api/admin/estimations?${params}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const json = await res.json()
      if (json.success) {
        setEstimations(json.data)
        setStats(json.stats)
      }
    } catch { }
    setLoading(false)
  }, [dateFrom, dateTo])

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

  const exportCSV = () => {
    const header = 'Date,Départ,Destination,Distance (km),Durée (min),Prix,Fourchette,Tarif,Forfait\n'
    const rows = estimations.map(e => {
      const fourchette = e.fourchette ? `${e.fourchette.de.toFixed(2)} - ${e.fourchette.a.toFixed(2)}` : '-'
      return `"${formatDate(e.createdAt)}","${e.from}","${e.to}",${e.distance.toFixed(1)},${e.duration},"${e.price.toFixed(2)}€","${fourchette}",${e.tariffType},${e.isForfait ? 'Oui' : 'Non'}`
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <button onClick={load}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Filtrer
        </button>
        <button onClick={exportCSV}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2">
          <DownloadSimple size={16} />
          Export CSV
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Date</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Départ</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Destination</th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">Dist.</th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">Prix</th>
                <th className="text-right px-4 py-3 text-slate-600 font-semibold">Fourchette</th>
                <th className="text-center px-4 py-3 text-slate-600 font-semibold">Tarif</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Chargement...</td></tr>
              ) : estimations.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Aucune estimation sur cette période</td></tr>
              ) : (
                estimations.map(e => (
                  <tr key={e._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(e.createdAt)}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
