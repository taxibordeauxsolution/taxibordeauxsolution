'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Taxi, ChartBar, Clock, CheckCircle, HourglassSimple, XCircle, ArrowRight, ArrowClockwise, CalendarBlank, CurrencyEur, MapPin, FunnelSimple, Globe, NavigationArrow, Phone, PhoneCall } from '@phosphor-icons/react'
import { getToken } from '@/app/admin/lib/token'

interface Funnel {
  estimations: number
  leads: number
  contactes: number
  convertis: number
  perdus: number
}

interface Stats {
  reservations: { total: number; en_attente: number; confirmee: number; en_route: number; terminee: number; annulee: number; lead_capture?: number }
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
    reservations: { total: 0, en_attente: 0, confirmee: 0, en_route: 0, terminee: 0, annulee: 0 },
    estimations: { total: 0, avgPrice: 0, funnel: { estimations: 0, leads: 0, contactes: 0, convertis: 0, perdus: 0 }, topSources: [] },
    revenus: { aujourdhui: 0, semaine: 0, mois: 0, semainePrecedente: 0, moisPrecedent: 0 },
  })
  const [recentResas, setRecentResas] = useState<Reservation[]>([])
  const [todayResas, setTodayResas] = useState<Reservation[]>([])
  const [recentLeads, setRecentLeads] = useState<Reservation[]>([])
  const [recentEstimations, setRecentEstimations] = useState<Estimation[]>([])
  const [loading, setLoading] = useState(true)
  const [newResaAlert, setNewResaAlert] = useState(false)
  const [newLeadAlert, setNewLeadAlert] = useState(false)
  const lastResaCountRef = useRef<number | null>(null)
  const lastLeadCountRef = useRef<number | null>(null)


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
      osc.onended = () => ctx.close()
    } catch {}
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Date d'aujourd'hui pour le fetch dédié "courses du jour"
      const now = new Date()
      const isoToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

      const auth = { headers: { Authorization: `Bearer ${getToken()}` } }
      const [resaRes, estRes, revenusRes, leadsRes, todayRes] = await Promise.all([
        fetch('/api/admin/reservations?limit=5', auth),
        fetch('/api/admin/estimations?limit=5', auth),
        fetch('/api/admin/revenus', auth),
        fetch('/api/admin/reservations?status=lead_capture&limit=5', auth),
        fetch(`/api/admin/reservations?from=${isoToday}&to=${isoToday}&limit=50`, auth),
      ])
      const [resaJson, estJson, revenusJson, leadsJson, todayJson] = await Promise.all([
        resaRes.json(), estRes.json(), revenusRes.json(), leadsRes.json(), todayRes.json(),
      ])

      if (leadsJson.success) setRecentLeads(leadsJson.data)
      if (todayJson.success) setTodayResas(todayJson.data)

      if (resaJson.success) {
        const leadCount = resaJson.stats.lead_capture || 0
        const resaCount = resaJson.stats.total
        if (lastResaCountRef.current !== null && resaCount > lastResaCountRef.current) {
          playNotificationSound()
          setNewResaAlert(true)
          setTimeout(() => setNewResaAlert(false), 5000)
        }
        if (lastLeadCountRef.current !== null && leadCount > lastLeadCountRef.current) {
          playNotificationSound()
          setNewLeadAlert(true)
          setTimeout(() => setNewLeadAlert(false), 5000)
        }
        lastResaCountRef.current = resaCount
        lastLeadCountRef.current = leadCount

        setStats(prev => ({ ...prev, reservations: resaJson.stats }))
        setRecentResas(resaJson.data)
      }
      if (revenusJson.success) {
        setStats(prev => ({ ...prev, revenus: revenusJson.data }))
      }
      if (estJson.success) {
        setStats(prev => ({ ...prev, estimations: { ...estJson.stats, funnel: estJson.stats.funnel || prev.estimations.funnel, topSources: estJson.stats.topSources || prev.estimations.topSources } }))
        setRecentEstimations(estJson.data)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Polling 30s — en pause quand l'onglet est inactif (économie data + facturation Vercel)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    const start = () => { if (!interval) interval = setInterval(load, 30000) }
    const stop = () => { if (interval) { clearInterval(interval); interval = null } }
    const onVisibility = () => { document.hidden ? stop() : (load(), start()) }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility) }
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
      default: return <Clock size={14} className="text-slate-600" />
    }
  }

  const updateResaStatus = async (id: string, status: string) => {
    // Update optimiste : on change l'UI immédiatement sans attendre le serveur
    const patch = (list: Reservation[]) => list.map(r => r._id === id ? { ...r, status } : r)
    setRecentResas(prev => patch(prev))
    setTodayResas(prev => patch(prev))
    setRecentLeads(prev => prev.filter(r => r._id !== id))

    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id, status })
      })
      if (!res.ok) load()  // rollback en rechargeant si erreur
    } catch {
      load()
    }
  }

  // Mémo des % de variation revenus (recalcul uniquement si stats.revenus change)
  const { diffSem, diffMois } = useMemo(() => ({
    diffSem: stats.revenus.semainePrecedente > 0
      ? Math.round(((stats.revenus.semaine - stats.revenus.semainePrecedente) / stats.revenus.semainePrecedente) * 100)
      : null,
    diffMois: stats.revenus.moisPrecedent > 0
      ? Math.round(((stats.revenus.mois - stats.revenus.moisPrecedent) / stats.revenus.moisPrecedent) * 100)
      : null,
  }), [stats.revenus])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowClockwise size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
          <ArrowClockwise size={16} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {newResaAlert && (
        <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-lg flex items-center gap-3 ring-2 ring-blue-400 ring-offset-2">
          <Taxi size={24} />
          <span className="font-bold">Nouvelle réservation !</span>
        </div>
      )}

      {newLeadAlert && (
        <div className="bg-purple-600 text-white rounded-2xl p-4 shadow-lg flex items-center gap-3 ring-2 ring-purple-400 ring-offset-2">
          <Phone size={24} />
          <span className="font-bold">Nouveau lead à rappeler !</span>
        </div>
      )}

      {/* Courses du jour — priorité opérationnelle, affiché en premier */}
      {todayResas.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800/60">
          <h2 className="text-base font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3">
            <CalendarBlank size={18} />
            Courses du jour ({todayResas.length})
          </h2>
          <div className="space-y-2">
            {todayResas.map(r => (
              <div key={r._id} className="bg-white dark:bg-slate-800 rounded-xl p-3 text-sm space-y-2">
                <div className="flex items-center gap-3">
                  {statusIcon(r.status)}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-white">{r.customer.name}</span>
                    <span className="text-slate-600 dark:text-slate-500 mx-1.5">·</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatDate(r.pickupDate)}</span>
                  </div>
                  <span className="font-bold text-green-700 dark:text-green-400 shrink-0">{formatPrix(r)}</span>
                </div>
                {(r.status === 'en_attente' || r.status === 'confirmee' || r.status === 'en_route') && (
                  <div className="flex items-center gap-2 pl-5">
                    {r.status === 'en_attente' && (
                      <button onClick={() => updateResaStatus(r._id, 'confirmee')} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">Confirmer</button>
                    )}
                    {(r.status === 'en_attente' || r.status === 'confirmee') && (
                      <button onClick={() => updateResaStatus(r._id, 'en_route')} className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-semibold hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors">En route</button>
                    )}
                    {(r.status === 'en_attente' || r.status === 'confirmee' || r.status === 'en_route') && (
                      <button onClick={() => updateResaStatus(r._id, 'terminee')} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors">Terminer</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-300 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Réservations</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.reservations.total}</div>
        </div>
        <div className="rounded-2xl p-4 shadow-sm border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50">
          <div className="text-xs text-yellow-700 dark:text-yellow-400">En attente</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.reservations.en_attente}</div>
        </div>
        <div className={`rounded-2xl p-4 shadow-sm border ${stats.reservations.en_route > 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'}`}>
          <div className={`text-xs ${stats.reservations.en_route > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>En route</div>
          <div className={`text-2xl font-bold ${stats.reservations.en_route > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>{stats.reservations.en_route}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-300 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Estimations</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.estimations.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-300 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Prix moyen</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.estimations.avgPrice.toFixed(0)}€</div>
        </div>
      </div>

      {/* Revenus */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 shadow-sm border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
          <div className="text-xs text-green-700 dark:text-green-400">Aujourd'hui</div>
          <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">{stats.revenus.aujourdhui.toFixed(0)}€</div>
        </div>
        <div className="rounded-2xl p-4 shadow-sm border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
          <div className="text-xs text-green-700 dark:text-green-400">Cette semaine</div>
          <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">{stats.revenus.semaine.toFixed(0)}€</div>
          {diffSem !== null && (
            <div className={`text-xs font-semibold mt-1 ${diffSem >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {diffSem >= 0 ? '+' : ''}{diffSem}% vs sem. préc.
            </div>
          )}
          {stats.revenus.semainePrecedente > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">{stats.revenus.semainePrecedente.toFixed(0)}€ sem. préc.</div>
          )}
        </div>
        <div className="rounded-2xl p-4 shadow-sm border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50">
          <div className="text-xs text-green-700 dark:text-green-400">Ce mois</div>
          <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">{stats.revenus.mois.toFixed(0)}€</div>
          {diffMois !== null && (
            <div className={`text-xs font-semibold mt-1 ${diffMois >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {diffMois >= 0 ? '+' : ''}{diffMois}% vs mois préc.
            </div>
          )}
          {stats.revenus.moisPrecedent > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">{stats.revenus.moisPrecedent.toFixed(0)}€ mois préc.</div>
          )}
        </div>
      </div>

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
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-300 dark:border-slate-700">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
              <FunnelSimple size={16} />
              Funnel de conversion
            </h2>
            <div className="space-y-3">
              {steps.map((s, i) => {
                const barWidth = i === 0 ? 100 : Math.max(8, (s.count / steps[0].count) * 100)
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {s.count}
                        {i > 0 && <span className="text-slate-600 dark:text-slate-500 font-normal ml-1">({s.pct}%{i === 1 ? ' des estim.' : ' des leads'})</span>}
                      </span>
                    </div>
                    <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                <span className="text-red-600 dark:text-red-400">Perdus</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{f.perdus} <span className="font-normal text-slate-600 dark:text-slate-500">({pctPerdu}% des leads)</span></span>
              </div>
            )}
          </div>
        )
      })()}

      {/* Top sources trafic */}
      {stats.estimations.topSources.length > 0 && stats.estimations.topSources.some(s => s.source !== 'direct') && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-300 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
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
                  <span className="text-sm text-slate-700 dark:text-slate-300 w-24 truncate font-medium">{s.source}</span>
                  <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold w-16 text-right">{s.count} <span className="text-slate-600 dark:text-slate-500 font-normal text-xs">({pct}%)</span></span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Dernières estimations — bloc plein et prominent (estimations = important) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ChartBar size={18} className="text-green-600 dark:text-green-400" />
            Dernières estimations
            <span className="text-xs font-normal text-slate-600 dark:text-slate-500 ml-1">({stats.estimations.total} total · {stats.estimations.avgPrice.toFixed(0)}€ moy.)</span>
          </h2>
          <Link href="/admin/estimations" className="text-xs text-green-700 dark:text-green-400 font-semibold flex items-center gap-1 hover:underline">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        {recentEstimations.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Aucune estimation sur cette période</p>
        ) : (
          <div className="space-y-2">
            {recentEstimations.map(e => (
              <div key={e._id} className="flex items-center gap-2 text-sm py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                <CurrencyEur size={14} className="text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {e.from.split(',')[0]} → {e.to.split(',')[0]}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-green-700 dark:text-green-400">{e.price.toFixed(0)}€</div>
                  <div className="text-xs text-slate-600 dark:text-slate-500">{formatDate(e.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dernières réservations */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Taxi size={16} />
            Dernières réservations
          </h2>
          <Link href="/admin/reservations" className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        {recentResas.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">Aucune réservation récente</p>
        ) : (
          <div className="space-y-2">
            {recentResas.map(r => (
              <div key={r._id} className="text-sm py-1.5 border-b border-slate-50 dark:border-slate-700 last:border-0 space-y-1">
                <div className="flex items-center gap-2">
                  {statusIcon(r.status)}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{r.customer.name}</span>
                    <div className="text-xs text-slate-600 dark:text-slate-500 truncate">
                      <MapPin size={10} className="inline" /> {(typeof r.trip.from === 'string' ? r.trip.from : r.trip.from?.address || '').split(',')[0]}
                      {' → '}
                      {(typeof r.trip.to === 'string' ? r.trip.to : r.trip.to?.address || '').split(',')[0]}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-green-700 dark:text-green-400 text-xs">{formatPrix(r)}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-500">{formatDate(r.pickupDate)}</div>
                  </div>
                </div>
                {(r.status === 'en_attente' || r.status === 'confirmee') && (
                  <div className="flex items-center gap-1.5 pl-5">
                    {r.status === 'en_attente' && (
                      <button onClick={() => updateResaStatus(r._id, 'confirmee')} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded text-xs font-semibold hover:bg-blue-200">Conf.</button>
                    )}
                    <button onClick={() => updateResaStatus(r._id, 'terminee')} className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded text-xs font-semibold hover:bg-green-200">Term.</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leads à rappeler — déplacé en bas (capture désactivée actuellement) */}
      {recentLeads.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
              <PhoneCall size={16} />
              Leads à rappeler ({stats.reservations.lead_capture || recentLeads.length})
            </h2>
            <Link href="/admin/leads" className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 hover:underline">
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentLeads.map(r => (
              <div key={r._id} className="bg-white dark:bg-slate-800 rounded-xl p-3 text-sm flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white">{r.customer.name}</span>
                    <a href={`tel:${r.customer.phone}`} className="text-purple-600 dark:text-purple-400 font-medium text-xs flex items-center gap-1">
                      <Phone size={12} /> {r.customer.phone}
                    </a>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-500 mt-0.5 truncate">
                    <MapPin size={10} className="inline" /> {(typeof r.trip.from === 'string' ? r.trip.from : r.trip.from?.address || '').split(',')[0]}
                    {' → '}
                    {(typeof r.trip.to === 'string' ? r.trip.to : r.trip.to?.address || '').split(',')[0]}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-green-700 dark:text-green-400 text-xs">{formatPrix(r)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-500">{formatDate(r.pickupDate)}</div>
                </div>
                <button onClick={() => updateResaStatus(r._id, 'en_attente')}
                  className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0">
                  Convertir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
