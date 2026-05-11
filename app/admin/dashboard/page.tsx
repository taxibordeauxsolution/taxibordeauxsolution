'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Taxi, ChartBar, Clock, CheckCircle, HourglassSimple, XCircle, ArrowRight, CalendarBlank, CurrencyEur, MapPin } from '@phosphor-icons/react'

interface Stats {
  reservations: { total: number; en_attente: number; confirmee: number; terminee: number; annulee: number }
  estimations: { total: number; avgPrice: number }
}

interface Reservation {
  _id: string
  reservationId: string
  status: string
  customer: { name: string; phone: string }
  trip: { from: string | { address?: string }; to: string | { address?: string } }
  pricing: { totalPrice: number; fourchette?: { de: number; a: number } }
  pickupDate: string
}

interface Estimation {
  _id: string
  from: string
  to: string
  price: number
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    reservations: { total: 0, en_attente: 0, confirmee: 0, terminee: 0, annulee: 0 },
    estimations: { total: 0, avgPrice: 0 },
  })
  const [recentResas, setRecentResas] = useState<Reservation[]>([])
  const [recentEstimations, setRecentEstimations] = useState<Estimation[]>([])
  const [loading, setLoading] = useState(true)

  const token = () => sessionStorage.getItem('admin_token') || ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [resaRes, estRes] = await Promise.all([
        fetch('/api/admin/reservations', { headers: { Authorization: `Bearer ${token()}` } }),
        fetch('/api/admin/estimations', { headers: { Authorization: `Bearer ${token()}` } }),
      ])
      const resaJson = await resaRes.json()
      const estJson = await estRes.json()

      if (resaJson.success) {
        setStats(prev => ({ ...prev, reservations: resaJson.stats }))
        setRecentResas(resaJson.data.slice(0, 5))
      }
      if (estJson.success) {
        setStats(prev => ({ ...prev, estimations: estJson.stats }))
        setRecentEstimations(estJson.data.slice(0, 5))
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) +
      ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrix = (r: Reservation) => {
    if (r.pricing.fourchette?.de && r.pricing.fourchette?.a) {
      return `${r.pricing.fourchette.de.toFixed(0)}–${r.pricing.fourchette.a.toFixed(0)}€`
    }
    return `${r.pricing.totalPrice.toFixed(0)}€`
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case 'en_attente': return <HourglassSimple size={14} className="text-yellow-600" />
      case 'confirmee': return <CheckCircle size={14} className="text-blue-600" />
      case 'terminee': return <CheckCircle size={14} className="text-green-600" />
      case 'annulee': return <XCircle size={14} className="text-red-600" />
      default: return <Clock size={14} className="text-slate-400" />
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Chargement...</div>
  }

  const todayResas = recentResas.filter(r => {
    const d = new Date(r.pickupDate)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Stats principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500">Réservations</div>
          <div className="text-2xl font-bold text-slate-900">{stats.reservations.total}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-200 bg-yellow-50">
          <div className="text-xs text-yellow-700">En attente</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.reservations.en_attente}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500">Estimations</div>
          <div className="text-2xl font-bold text-slate-900">{stats.estimations.total}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500">Prix moyen</div>
          <div className="text-2xl font-bold text-green-700">{stats.estimations.avgPrice.toFixed(0)}€</div>
        </div>
      </div>

      {/* Courses du jour */}
      {todayResas.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <h2 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-3">
            <CalendarBlank size={16} />
            Courses du jour ({todayResas.length})
          </h2>
          <div className="space-y-2">
            {todayResas.map(r => (
              <div key={r._id} className="bg-white rounded-xl p-3 flex items-center gap-3 text-sm">
                {statusIcon(r.status)}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-900">{r.customer.name}</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-slate-500">{formatDate(r.pickupDate)}</span>
                </div>
                <span className="font-bold text-green-700 shrink-0">{formatPrix(r)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deux colonnes : dernières résas + dernières estimations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dernières réservations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Taxi size={16} />
              Dernières réservations
            </h2>
            <Link href="/admin/reservations" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          {recentResas.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Aucune réservation</p>
          ) : (
            <div className="space-y-2">
              {recentResas.map(r => (
                <div key={r._id} className="flex items-center gap-2 text-sm py-1.5 border-b border-slate-50 last:border-0">
                  {statusIcon(r.status)}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-800">{r.customer.name}</span>
                    <div className="text-xs text-slate-400 truncate">
                      <MapPin size={10} className="inline" /> {(typeof r.trip.from === 'string' ? r.trip.from : r.trip.from?.address || '').split(',')[0]}
                      {' → '}
                      {(typeof r.trip.to === 'string' ? r.trip.to : r.trip.to?.address || '').split(',')[0]}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-green-700 text-xs">{formatPrix(r)}</div>
                    <div className="text-xs text-slate-400">{formatDate(r.pickupDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dernières estimations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ChartBar size={16} />
              Dernières estimations
            </h2>
            <Link href="/admin/estimations" className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          {recentEstimations.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Aucune estimation</p>
          ) : (
            <div className="space-y-2">
              {recentEstimations.map(e => (
                <div key={e._id} className="flex items-center gap-2 text-sm py-1.5 border-b border-slate-50 last:border-0">
                  <CurrencyEur size={14} className="text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 truncate">
                      {e.from.split(',')[0]} → {e.to.split(',')[0]}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-green-700 text-xs">{e.price.toFixed(0)}€</div>
                    <div className="text-xs text-slate-400">{formatDate(e.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
