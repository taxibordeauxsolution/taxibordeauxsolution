'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Taxi, ChartBar, Clock, CheckCircle, HourglassSimple, XCircle, ArrowRight, CalendarBlank, CurrencyEur, MapPin, FunnelSimple, Globe, NavigationArrow } from '@phosphor-icons/react'

interface Funnel {
  estimations: number
  leads: number
  contactes: number
  convertis: number
  perdus: number
}

interface Stats {
  reservations: { total: number; en_attente: number; confirmee: number; terminee: number; annulee: number }
  estimations: { total: number; avgPrice: number; funnel: Funnel; topSources: { source: string; count: number }[] }
  revenus: { aujourdhui: number; semaine: number; mois: number; semainePrecedente: number; moisPrecedent: number }
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
    estimations: { total: 0, avgPrice: 0, funnel: { estimations: 0, leads: 0, contactes: 0, convertis: 0, perdus: 0 }, topSources: [] },
    revenus: { aujourdhui: 0, semaine: 0, mois: 0, semainePrecedente: 0, moisPrecedent: 0 },
  })
  const [recentResas, setRecentResas] = useState<Reservation[]>([])
  const [recentEstimations, setRecentEstimations] = useState<Estimation[]>([])
  const [loading, setLoading] = useState(true)
  const [newResaAlert, setNewResaAlert] = useState(false)
  const lastResaCountRef = useRef<number | null>(null)

  const token = () => sessionStorage.getItem('admin_token') || ''

  const playNotificationSound = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.3
      osc.start()
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.15)
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.4)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [resaRes, estRes, allTermRes] = await Promise.all([
        fetch('/api/admin/reservations', { headers: { Authorization: `Bearer ${token()}` } }),
        fetch('/api/admin/estimations', { headers: { Authorization: `Bearer ${token()}` } }),
        fetch('/api/admin/reservations?status=terminee&limit=500', { headers: { Authorization: `Bearer ${token()}` } }),
      ])
      const resaJson = await resaRes.json()
      const estJson = await estRes.json()

      const allTermJson = await allTermRes.json()

      if (resaJson.success) {
        const newTotal = resaJson.stats.total
        if (lastResaCountRef.current !== null && newTotal > lastResaCountRef.current) {
          playNotificationSound()
          setNewResaAlert(true)
          setTimeout(() => setNewResaAlert(false), 5000)
        }
        lastResaCountRef.current = newTotal

        setStats(prev => ({ ...prev, reservations: resaJson.stats }))
        setRecentResas(resaJson.data.slice(0, 5))

        const allTerminees = allTermJson.success ? (allTermJson.data as Reservation[]) : []
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(todayStart)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
        const prevWeekStart = new Date(weekStart)
        prevWeekStart.setDate(prevWeekStart.getDate() - 7)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        const sum = (list: Reservation[]) => list.reduce((s, r) => s + (r.pricing.totalPrice || 0), 0)

        setStats(prev => ({
          ...prev,
          revenus: {
            aujourdhui: sum(allTerminees.filter(r => new Date(r.pickupDate) >= todayStart)),
            semaine: sum(allTerminees.filter(r => new Date(r.pickupDate) >= weekStart)),
            mois: sum(allTerminees.filter(r => new Date(r.pickupDate) >= monthStart)),
            semainePrecedente: sum(allTerminees.filter(r => { const d = new Date(r.pickupDate); return d >= prevWeekStart && d < weekStart })),
            moisPrecedent: sum(allTerminees.filter(r => { const d = new Date(r.pickupDate); return d >= prevMonthStart && d < monthStart })),
          }
        }))
      }
      if (estJson.success) {
        setStats(prev => ({ ...prev, estimations: { ...estJson.stats, funnel: estJson.stats.funnel || prev.estimations.funnel, topSources: estJson.stats.topSources || prev.estimations.topSources } }))
        setRecentEstimations(estJson.data.slice(0, 5))
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [load])

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
      case 'en_route': return <NavigationArrow size={14} className="text-orange-600" />
      case 'terminee': return <CheckCircle size={14} className="text-green-600" />
      case 'annulee': return <XCircle size={14} className="text-red-600" />
      default: return <Clock size={14} className="text-slate-400" />
    }
  }

  const updateResaStatus = async (id: string, status: string) => {
    await fetch('/api/admin/reservations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id, status })
    })
    load()
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

      {newResaAlert && (
        <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg flex items-center gap-3 animate-pulse">
          <Taxi size={24} />
          <span className="font-bold">Nouvelle réservation !</span>
        </div>
      )}

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

      {/* Revenus */}
      {(() => {
        const diffSem = stats.revenus.semainePrecedente > 0
          ? Math.round(((stats.revenus.semaine - stats.revenus.semainePrecedente) / stats.revenus.semainePrecedente) * 100)
          : null
        const diffMois = stats.revenus.moisPrecedent > 0
          ? Math.round(((stats.revenus.mois - stats.revenus.moisPrecedent) / stats.revenus.moisPrecedent) * 100)
          : null
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-200 bg-green-50">
              <div className="text-xs text-green-700">Aujourd'hui</div>
              <div className="text-xl sm:text-2xl font-bold text-green-700">{stats.revenus.aujourdhui.toFixed(0)}€</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-200 bg-green-50">
              <div className="text-xs text-green-700">Cette semaine</div>
              <div className="text-xl sm:text-2xl font-bold text-green-700">{stats.revenus.semaine.toFixed(0)}€</div>
              {diffSem !== null && (
                <div className={`text-xs font-semibold mt-1 ${diffSem >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diffSem >= 0 ? '+' : ''}{diffSem}% vs sem. préc.
                </div>
              )}
              {stats.revenus.semainePrecedente > 0 && (
                <div className="text-[10px] text-slate-400">{stats.revenus.semainePrecedente.toFixed(0)}€ sem. préc.</div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-200 bg-green-50">
              <div className="text-xs text-green-700">Ce mois</div>
              <div className="text-xl sm:text-2xl font-bold text-green-700">{stats.revenus.mois.toFixed(0)}€</div>
              {diffMois !== null && (
                <div className={`text-xs font-semibold mt-1 ${diffMois >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diffMois >= 0 ? '+' : ''}{diffMois}% vs mois préc.
                </div>
              )}
              {stats.revenus.moisPrecedent > 0 && (
                <div className="text-[10px] text-slate-400">{stats.revenus.moisPrecedent.toFixed(0)}€ mois préc.</div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Funnel de conversion */}
      {stats.estimations.funnel.estimations > 0 && (() => {
        const f = stats.estimations.funnel
        const pctLead = f.estimations > 0 ? Math.round((f.leads / f.estimations) * 100) : 0
        const pctContacte = f.leads > 0 ? Math.round((f.contactes / f.leads) * 100) : 0
        const pctConverti = f.leads > 0 ? Math.round((f.convertis / f.leads) * 100) : 0
        const pctPerdu = f.leads > 0 ? Math.round((f.perdus / f.leads) * 100) : 0
        const steps = [
          { label: 'Estimations', count: f.estimations, pct: 100, color: 'bg-slate-500', width: 'w-full' },
          { label: 'Leads (email)', count: f.leads, pct: pctLead, color: 'bg-blue-500', width: '' },
          { label: 'Contactés', count: f.contactes, pct: pctContacte, color: 'bg-amber-500', width: '' },
          { label: 'Convertis', count: f.convertis, pct: pctConverti, color: 'bg-green-500', width: '' },
        ]
        return (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FunnelSimple size={16} />
              Funnel de conversion
            </h2>
            <div className="space-y-3">
              {steps.map((s, i) => {
                const barWidth = i === 0 ? 100 : Math.max(8, (s.count / steps[0].count) * 100)
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{s.label}</span>
                      <span className="font-semibold text-slate-900">
                        {s.count}
                        {i > 0 && <span className="text-slate-400 font-normal ml-1">({s.pct}%{i === 1 ? ' des estim.' : ' des leads'})</span>}
                      </span>
                    </div>
                    <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full transition-all duration-500`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            {f.perdus > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="text-red-600">Perdus</span>
                <span className="font-semibold text-red-600">{f.perdus} <span className="font-normal text-slate-400">({pctPerdu}% des leads)</span></span>
              </div>
            )}
          </div>
        )
      })()}

      {/* Top sources trafic */}
      {stats.estimations.topSources.length > 0 && stats.estimations.topSources.some(s => s.source !== 'direct') && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Globe size={16} />
            Sources de trafic
          </h2>
          <div className="space-y-2">
            {stats.estimations.topSources.map((s, i) => {
              const pct = stats.estimations.total > 0 ? Math.round((s.count / stats.estimations.total) * 100) : 0
              const colors: Record<string, string> = { google: 'bg-blue-500', facebook: 'bg-indigo-500', instagram: 'bg-pink-500', direct: 'bg-slate-400' }
              const color = colors[s.source.toLowerCase()] || 'bg-purple-500'
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 w-24 truncate font-medium">{s.source}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                  <span className="text-sm text-slate-600 font-semibold w-16 text-right">{s.count} <span className="text-slate-400 font-normal text-xs">({pct}%)</span></span>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'en_attente' && (
                    <button onClick={() => updateResaStatus(r._id, 'confirmee')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">Confirmer</button>
                  )}
                  {(r.status === 'en_attente' || r.status === 'confirmee') && (
                    <button onClick={() => updateResaStatus(r._id, 'en_route')} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-200 transition-colors">En route</button>
                  )}
                  {(r.status === 'en_attente' || r.status === 'confirmee' || r.status === 'en_route') && (
                    <button onClick={() => updateResaStatus(r._id, 'terminee')} className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">Terminer</button>
                  )}
                  <span className="font-bold text-green-700">{formatPrix(r)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendrier semaine */}
      {(() => {
        const now = new Date()
        const weekStartCal = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        weekStartCal.setDate(weekStartCal.getDate() - weekStartCal.getDay() + 1)
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStartCal)
          d.setDate(d.getDate() + i)
          return d
        })
        const joursFR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        return (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <CalendarBlank size={16} />
              Semaine en cours
            </h2>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, i) => {
                const isToday = day.toDateString() === now.toDateString()
                const dayResas = recentResas.filter(r => new Date(r.pickupDate).toDateString() === day.toDateString())
                return (
                  <div key={i} className={`rounded-xl p-2 text-center ${isToday ? 'bg-blue-50 border-2 border-blue-400' : 'bg-slate-50 border border-slate-200'}`}>
                    <div className={`text-[10px] font-semibold ${isToday ? 'text-blue-700' : 'text-slate-500'}`}>{joursFR[i]}</div>
                    <div className={`text-sm font-bold ${isToday ? 'text-blue-800' : 'text-slate-700'}`}>{day.getDate()}</div>
                    {dayResas.length > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        {dayResas.slice(0, 3).map(r => (
                          <div key={r._id} className="text-[9px] bg-white rounded px-1 py-0.5 truncate text-slate-700 border border-slate-100">
                            {r.customer.name.split(' ')[0]} {formatPrix(r)}
                          </div>
                        ))}
                        {dayResas.length > 3 && <div className="text-[9px] text-slate-400">+{dayResas.length - 3}</div>}
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-300 mt-1">—</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

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
                  <div className="flex items-center gap-1.5 shrink-0">
                    {r.status === 'en_attente' && (
                      <button onClick={() => updateResaStatus(r._id, 'confirmee')} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold hover:bg-blue-200">Conf.</button>
                    )}
                    {(r.status === 'en_attente' || r.status === 'confirmee') && (
                      <button onClick={() => updateResaStatus(r._id, 'terminee')} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold hover:bg-green-200">Term.</button>
                    )}
                    <div className="text-right">
                      <div className="font-bold text-green-700 text-xs">{formatPrix(r)}</div>
                      <div className="text-xs text-slate-400">{formatDate(r.pickupDate)}</div>
                    </div>
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
