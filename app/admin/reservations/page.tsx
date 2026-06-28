'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ArrowClockwise, Trash, Taxi, Phone, Envelope, MapPin,
  CheckCircle, XCircle, HourglassSimple, CaretDown, CaretLeft, CaretRight,
  MagnifyingGlass, Receipt, NavigationArrow, PlusCircle, PencilSimple,
  ArrowsLeftRight, UserList, Export, X, AddressBook, DeviceMobile, Star,
} from '@phosphor-icons/react'
import jsPDF from 'jspdf'
import { getToken } from '@/app/admin/lib/token'
import { SkeletonList } from '@/app/admin/components/Skeleton'
import { EmptyState } from '@/app/admin/components/EmptyState'
import { ConfirmDialog } from '@/app/admin/components/ConfirmDialog'
import { CopyButton } from '@/app/admin/components/CopyButton'
import { useToast } from '@/app/admin/components/Toast'

interface Reservation {
  _id: string
  reservationId: string
  status: string
  invoiceNumber?: number
  customer: { name: string; phone: string; email: string }
  trip: { from: string | { address?: string }; to: string | { address?: string }; distance: number }
  pricing: { totalPrice: number; fourchette?: { de: number; a: number }; tariffType: string; isForfait: boolean }
  passengers: number
  luggage: number
  notes: string
  adminNotes?: string
  pickupDate: string
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: HourglassSimple },
  confirmee:  { label: 'Confirmée',  color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',   icon: CheckCircle },
  en_route:   { label: 'En route',   color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300', icon: NavigationArrow },
  terminee:   { label: 'Terminée',   color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',  icon: CheckCircle },
  annulee:    { label: 'Annulée',    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',      icon: XCircle },
}

function addrStr(v: string | { address?: string }): string {
  return typeof v === 'string' ? v : v?.address || ''
}

const wazeUrl = (addr: string) => `waze://ul?q=${encodeURIComponent(addr)}&navigate=yes`

// Construit l'URL du formulaire de réservation client avec les infos pré-remplies
function buildBookingUrl(r: Reservation, retour = false): string {
  const p = new URLSearchParams({
    name:  r.customer.name,
    phone: r.customer.phone,
    ...(r.customer.email ? { email: r.customer.email } : {}),
    ...(retour ? { from: addrStr(r.trip.to), to: addrStr(r.trip.from) } : {}),
  })
  return `/booking?${p.toString()}`
}

// ── Mini-modal Modifier (édite une résa existante sans recréer) ──────────────
function EditModal({ r, token, onClose, onSaved }: {
  r: Reservation; token: string; onClose: () => void; onSaved: () => void
}) {
  const pd       = new Date(r.pickupDate)
  const [name,       setName]       = useState(r.customer.name)
  const [phone,      setPhone]      = useState(r.customer.phone)
  const [email,      setEmail]      = useState(r.customer.email)
  const [date,       setDate]       = useState(pd.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }))
  const [time,       setTime]       = useState(pd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }))
  const [price,      setPrice]      = useState(String(r.pricing.totalPrice))
  const [notes,      setNotes]      = useState(r.notes)
  const [adminNotes, setAdminNotes] = useState(r.adminNotes || '')
  const [notifyClient, setNotifyClient] = useState(false)
  const [notifySms,    setNotifySms]    = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error,  setError]          = useState('')

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: r._id, editFull: true, notifyClient,
          customer: { name: name.trim(), phone: phone.trim(), email: email.trim() },
          pickupDate: new Date(date + 'T' + time).toISOString(),
          pricing: { totalPrice: parseFloat(price) || r.pricing.totalPrice, tariffType: r.pricing.tariffType, isForfait: r.pricing.isForfait },
          trip: { from: addrStr(r.trip.from), to: addrStr(r.trip.to), distance: r.trip.distance },
          passengers: r.passengers, luggage: r.luggage,
          notes, adminNotes,
        }),
      })
      const json = await res.json()
      if (json.success) {
        if (notifySms) {
          const d = new Date(date + 'T' + time)
          const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' })
          const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
          const msg = `Bonjour ${name.trim().split(' ')[0]}, votre course a été modifiée. Nouveau créneau : le ${dateStr} à ${timeStr}, de ${addrStr(r.trip.from).split(',')[0]} → ${addrStr(r.trip.to).split(',')[0]}. À bientôt ! Taxi Bordeaux Solution +33 5 54 54 34 66`
          window.open(`sms:${phone.trim()}?body=${encodeURIComponent(msg)}`)
        }
        onSaved()
      } else setError(json.message || 'Erreur')
    } catch { setError('Erreur réseau') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md my-4 animate-modal-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><PencilSimple size={18} weight="bold" /> Modifier la course</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-slate-500 dark:text-slate-400">Nom</label>
              <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Téléphone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Heure</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 dark:text-slate-400">Prix (€)</label>
              <input type="number" min="0" step="0.5" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Notes client</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 resize-none" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">Notes admin</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-100 rounded-lg text-sm focus:border-amber-400 focus:outline-none resize-none" />
            </div>
          </div>
          <div className="space-y-2">
            {r.customer.email && (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
                <input type="checkbox" checked={notifyClient} onChange={e => setNotifyClient(e.target.checked)} className="rounded border-slate-300" />
                Notifier par email ({r.customer.email})
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" checked={notifySms} onChange={e => setNotifySms(e.target.checked)} className="rounded border-slate-300" />
              Notifier par SMS ({phone || r.customer.phone})
            </label>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-slate-300 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modale historique client ─────────────────────────────────────────────────
function HistoriqueModal({ name, phone, token, onClose }: { name: string; phone: string; token: string; onClose: () => void }) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/reservations?search=${encodeURIComponent(phone)}&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => { if (j.success) setReservations(j.data) })
      .finally(() => setLoading(false))
  }, [phone, token])

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg my-4 animate-modal-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserList size={20} weight="bold" />
            Historique — {name}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {loading ? <p className="text-center text-slate-600 dark:text-slate-500 py-8">Chargement...</p> :
           reservations.length === 0 ? <p className="text-center text-slate-600 dark:text-slate-500 py-8">Aucune réservation trouvée</p> :
           reservations.map(r => {
             const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.en_attente
             return (
               <div key={r._id} className="border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm">
                 <div className="flex items-center justify-between mb-1">
                   <span className="font-semibold text-slate-800 dark:text-slate-200">{r.reservationId}</span>
                   <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                 </div>
                 <div className="text-slate-500 dark:text-slate-400 text-xs">{formatDate(r.pickupDate)}</div>
                 <div className="text-slate-600 dark:text-slate-400 mt-1 truncate">
                   {addrStr(r.trip.from).split(',')[0]} → {addrStr(r.trip.to).split(',')[0]}
                 </div>
                 <div className="text-green-700 dark:text-green-400 font-bold mt-1">
                   {r.pricing.fourchette ? `${r.pricing.fourchette.de.toFixed(2)}€–${r.pricing.fourchette.a.toFixed(2)}€` : `${r.pricing.totalPrice.toFixed(2)}€`}
                 </div>
               </div>
             )
           })}
        </div>
      </div>
    </div>
  )
}

// ── Notes admin éditables inline ────────────────────────────────────────────
function InlineAdminNote({ reservationId, initial }: { reservationId: string; initial: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id: reservationId, adminNotes: value }),
      })
      setEditing(false)
    } catch (e) { console.error('Erreur sauvegarde note:', e) }
    setSaving(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`w-full text-left px-3 py-2 rounded-lg border border-dashed text-xs transition-colors ${
          value
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300'
            : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-500 hover:border-amber-300 dark:hover:border-amber-700'
        }`}
      >
        <span className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Notes internes</span>
        {value || 'Cliquer pour ajouter une note…'}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={3}
        autoFocus
        placeholder="Note interne…"
        className="w-full px-3 py-2 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-100 rounded-lg text-xs focus:outline-none resize-none"
      />
      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button onClick={() => { setValue(initial); setEditing(false) }}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          Annuler
        </button>
      </div>
    </div>
  )
}

// ── Page principale ─────────────────────────────────────────────────────────
export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState({ total: 0, en_attente: 0, confirmee: 0, en_route: 0, terminee: 0, annulee: 0 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const toggleSection = (key: string) => setOpenSections(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  const [page, setPage] = useState(() => {
    if (typeof window === 'undefined') return 1
    const p = new URLSearchParams(window.location.search).get('page')
    return p ? Math.max(1, parseInt(p) || 1) : 1
  })
  const [totalPages, setTotalPages] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const { toast } = useToast()
  const [dateTo, setDateTo]     = useState('')

  // Modales
  const [editModal,  setEditModal]  = useState<Reservation | null>(null)
  const [histModal,  setHistModal]  = useState<{ name: string; phone: string } | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(searchTimerRef.current)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo)   params.set('to', dateTo)
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('page', String(page))
      params.set('limit', '20')
      const res  = await fetch(`/api/admin/reservations?${params}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const json = await res.json()
      if (json.success) { setReservations(json.data); setStats(json.stats); setTotalPages(json.pagination?.totalPages || 1) }
    } catch (e) { console.error('Erreur chargement réservations:', e) }
    setLoading(false)
  }, [statusFilter, page, dateFrom, dateTo, debouncedSearch])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (page === 1) { params.delete('page') } else { params.set('page', String(page)) }
    const qs = params.toString()
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname)
  }, [page])

  const showNotif = (type: 'success' | 'info' | 'warning', msg: string) => {
    toast(msg, type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'success')
  }

  const updateStatus = async (id: string, status: string) => {
    setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r))
    try {
      const res  = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json()
      if (!res.ok) { load(); return }
      if (status === 'annulee') {
        if (json.cancelEmailSent)    showNotif('success', `Email d'annulation envoyé à ${json.customerEmail}`)
        else if (json.customerEmail) showNotif('warning', `Échec envoi email à ${json.customerEmail} — Appelez le ${json.customerPhone}`)
        else                         showNotif('info',    `Aucun email client — Appelez le ${json.customerPhone} pour prévenir`)
      }
    } catch (e) { console.error('Erreur mise à jour statut:', e); load() }
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    await fetch('/api/admin/reservations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ids: [...selected] }),
    })
    setSelected(new Set())
    load()
  }

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll    = () => selected.size === reservations.length ? setSelected(new Set()) : setSelected(new Set(reservations.map(r => r._id)))

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrix = (r: Reservation) => r.pricing.fourchette?.de && r.pricing.fourchette?.a
    ? `${r.pricing.fourchette.de.toFixed(2)}€ à ${r.pricing.fourchette.a.toFixed(2)}€`
    : `${r.pricing.totalPrice.toFixed(2)}€`

  const isPast = (d: string) => new Date(d) < new Date()

  // Export CSV
  const exportCsv = () => {
    const rows = [
      ['N° Résa', 'Statut', 'Client', 'Téléphone', 'Email', 'Départ', 'Destination', 'Distance (km)', 'Date prise en charge', 'Prix', 'Tarif', 'Passagers', 'Bagages', 'Notes', 'Notes admin', 'Créée le'],
      ...reservations.map(r => [
        r.reservationId, r.status, r.customer.name, r.customer.phone, r.customer.email,
        addrStr(r.trip.from), addrStr(r.trip.to), r.trip.distance.toFixed(1),
        new Date(r.pickupDate).toLocaleString('fr-FR'),
        r.pricing.fourchette ? `${r.pricing.fourchette.de.toFixed(2)}-${r.pricing.fourchette.a.toFixed(2)}` : r.pricing.totalPrice.toFixed(2),
        r.pricing.tariffType, r.passengers, r.luggage,
        (r.notes || '').replace(/"/g, '""'), (r.adminNotes || '').replace(/"/g, '""'),
        new Date(r.createdAt).toLocaleString('fr-FR'),
      ])
    ]
    const csv = rows.map(row => row.map(v => `"${v}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `reservations-${new Date().toLocaleDateString('fr-CA')}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const loadLogoBase64 = (): Promise<string> => new Promise((resolve) => {
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d')?.drawImage(img, 0, 0); resolve(c.toDataURL('image/png')) }
    img.onerror = () => resolve('')
    img.src = '/images/logo/Logo Taxi Bordeaux Solution.png.png'
  })

  const generateInvoice = async (r: Reservation) => {
    try {
      // Chargement du profil de facturation de l'utilisateur connecté
      const profilRes  = await fetch('/api/admin/profil', { headers: { Authorization: `Bearer ${getToken()}` } })
      const profilJson = await profilRes.json()
      const profil = profilJson.data || {}
      const factNom               = profil.nomEntreprise     || 'Taxi Bordeaux Solution'
      const factAdresse           = profil.adresse            || 'Sainte-Eulalie, 33560'
      const factTel               = profil.telephone          || '+33 5 54 54 34 66'
      const factEmail             = profil.emailFacturation   || 'contact@taxibordeauxsolution.fr'
      const factSiret             = profil.siret              || '987 573 128 00012'
      const factNumeroTva         = profil.numeroTva          || ''
      const factFormeJuridique    = profil.formeJuridique     || ''
      const factCapitalSocial     = profil.capitalSocial      || ''
      const factIban              = profil.iban               || ''
      const factConditions        = profil.conditionsPaiement || 'Paiement comptant'

      const estimation = r.pricing.totalPrice
      const input = window.prompt(
        `Prix final TTC à facturer\n\nEstimation : ${estimation.toFixed(2)} €\n\nLaissez tel quel ou modifiez le prix réel facturé :`,
        estimation.toFixed(2)
      )
      if (input === null) return
      const finalPrice = parseFloat(input.replace(',', '.'))
      if (isNaN(finalPrice) || finalPrice < 0) { alert('Prix invalide'); return }

      if (Math.abs(finalPrice - estimation) > 0.01) {
        const updateRes = await fetch('/api/admin/reservations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ id: r._id, totalPrice: finalPrice }),
        })
        const updateJson = await updateRes.json()
        if (!updateJson.success) { alert('Erreur mise à jour du prix'); return }
        r = { ...r, pricing: { ...r.pricing, totalPrice: finalPrice, fourchette: undefined } }
      }

      const [res, logoBase64] = await Promise.all([
        fetch('/api/admin/invoice-number', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ reservationId: r._id }),
        }),
        loadLogoBase64(),
      ])
      const json = await res.json().catch(() => ({ success: false, message: 'Réponse invalide du serveur' }))
      if (!json.success) { alert(`Erreur numéro de facture : ${json.message || 'inconnue'}`); return }
      const num = json.invoiceNumber

      const doc = new jsPDF()
      const w = doc.internal.pageSize.getWidth()
      let y = 15

      if (logoBase64) doc.addImage(logoBase64, 'PNG', 20, y, 40, 40)
      const textX = logoBase64 ? 65 : 20
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
      let enteteY = y + 10
      if (factFormeJuridique) { doc.text(factFormeJuridique + (factCapitalSocial ? ` — Capital : ${factCapitalSocial}` : ''), textX, enteteY); enteteY += 5 }
      doc.text(factAdresse, textX, enteteY); enteteY += 5
      doc.text(`Tél : ${factTel}`, textX, enteteY); enteteY += 5
      doc.text(`Email : ${factEmail}`, textX, enteteY); enteteY += 5
      doc.text(`SIRET : ${factSiret}`, textX, enteteY); enteteY += 5
      if (factNumeroTva) { doc.text(`TVA : ${factNumeroTva}`, textX, enteteY); enteteY += 5 }
      y = Math.max(y + 45, enteteY + 5)

      doc.setDrawColor(30, 64, 175); doc.setLineWidth(0.8); doc.line(20, y, w - 20, y); y += 10
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(30, 30, 30)
      doc.text(`FACTURE N° FAC-${num}`, 20, y)
      const dateFacture = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
      doc.text(`Date : ${dateFacture}`, w - 20, y, { align: 'right' })
      y += 7; doc.setFontSize(9); doc.setTextColor(120, 120, 120)
      doc.text(`Réservation : ${r.reservationId}`, 20, y); y += 12

      doc.setFillColor(245, 247, 250)
      doc.roundedRect(20, y, w - 40, r.customer.email ? 32 : 27, 3, 3, 'F')
      y += 7
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30); doc.text('Client', 26, y); y += 6
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 60, 60)
      doc.text(r.customer.name, 26, y); y += 5
      doc.text(`Tél : ${r.customer.phone}`, 26, y)
      if (r.customer.email) { y += 5; doc.text(`Email : ${r.customer.email}`, 26, y) }
      y += 14

      const fromAddr = addrStr(r.trip.from)
      const toAddr   = addrStr(r.trip.to)
      const fromLines = doc.splitTextToSize(`De : ${fromAddr}`, w - 52)
      const toLines   = doc.splitTextToSize(`À : ${toAddr}`, w - 52)
      const trajetH   = 15 + (fromLines.length + toLines.length) * 5

      doc.setFillColor(245, 247, 250)
      doc.roundedRect(20, y, w - 40, trajetH, 3, 3, 'F')
      y += 7
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30); doc.text('Trajet', 26, y); y += 6
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60, 60, 60)
      doc.text(fromLines, 26, y); y += fromLines.length * 5
      doc.text(toLines, 26, y); y += toLines.length * 5
      doc.text(`Date de prise en charge : ${new Date(r.pickupDate).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 26, y)
      y += 14

      const ttc = r.pricing.totalPrice
      const ht  = Math.round((ttc / 1.10) * 100) / 100
      const tva = Math.round((ttc - ht) * 100) / 100

      doc.setFillColor(30, 64, 175)
      doc.roundedRect(20, y, w - 40, 10, 2, 2, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255)
      doc.text('Description', 26, y + 7); doc.text('Montant', w - 26, y + 7, { align: 'right' })
      y += 14
      doc.setTextColor(60, 60, 60); doc.setFont('helvetica', 'normal')
      doc.text('Course taxi', 26, y); doc.text(`${ht.toFixed(2)} €`, w - 26, y, { align: 'right' }); y += 8
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(20, y, w - 20, y); y += 6
      doc.text('TVA 10%', 26, y); doc.text(`${tva.toFixed(2)} €`, w - 26, y, { align: 'right' }); y += 8
      doc.setDrawColor(30, 64, 175); doc.setLineWidth(0.8); doc.line(20, y, w - 20, y); y += 8
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(30, 64, 175)
      doc.text('TOTAL TTC', 26, y); doc.text(`${ttc.toFixed(2)} €`, w - 26, y, { align: 'right' })
      y += 14

      // Conditions de paiement + IBAN
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60)
      doc.text(`Conditions de paiement : ${factConditions}`, 20, y); y += 5
      doc.text('Escompte : Aucun escompte consenti pour paiement anticipé.', 20, y); y += 5
      if (factIban) { doc.text(`Virement : ${factIban}`, 20, y); y += 5 }
      y += 3

      // Mentions légales obligatoires
      doc.setFontSize(7.5); doc.setTextColor(120, 120, 120)
      const mentionLines = doc.splitTextToSize(
        'Pénalités de retard : En cas de retard de paiement, une pénalité calculée au taux d\'intérêt légal majoré de 10 points sera appliquée, ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40 € (art. L.441-10 C. com.).',
        w - 40
      )
      doc.text(mentionLines, 20, y); y += mentionLines.length * 4 + 3

      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3); doc.line(20, y, w - 20, y)

      doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(150, 150, 150)
      doc.text(`Merci pour votre confiance — ${factNom}`, w / 2, 280, { align: 'center' })
      doc.save(`Facture-FAC-${num}-${r.customer.name.replace(/\s+/g, '_')}.pdf`)

      const defaultEmail = r.customer.email || ''
      const emailDest = window.prompt(
        `Envoyer la facture FAC-${num} par email ?\n\n` +
        (r.customer.email ? `Email du client : ${r.customer.email}` : `⚠️ Pas d'email client — saisissez une adresse (ou Annuler pour ignorer)`) +
        `\nTéléphone : ${r.customer.phone}`,
        defaultEmail
      )
      if (emailDest && emailDest.includes('@')) {
        try {
          const pdfBase64 = doc.output('datauristring').split(',')[1]
          const sendRes   = await fetch('/api/admin/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({ email: emailDest, pdfBase64, invoiceNumber: num, reservationId: r.reservationId, customerName: r.customer.name }),
          })
          const sendJson = await sendRes.json()
          if (sendJson.success) showNotif('success', `Facture FAC-${num} envoyée à ${emailDest}`)
          else showNotif('warning', `Erreur envoi email : ${sendJson.message}`)
        } catch { showNotif('warning', "Erreur lors de l'envoi de la facture") }
      }
    } catch (e: any) { toast(`Erreur : ${e instanceof Error ? e.message : 'inconnue'}`, 'error') }
  }

  const sendReviewEmail = async (r: Reservation) => {
    if (!r.customer.email) return
    try {
      const res  = await fetch('/api/admin/send-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ email: r.customer.email, customerName: r.customer.name }),
      })
      const json = await res.json()
      if (json.success) showNotif('success', `Demande d'avis envoyée à ${r.customer.email}`)
      else showNotif('warning', `Erreur : ${json.message}`)
    } catch { showNotif('warning', "Erreur lors de l'envoi") }
  }

  return (
    <div className="space-y-6">
      {/* Modales */}
      {editModal && (
        <EditModal
          r={editModal}
          token={getToken()}
          onClose={() => setEditModal(null)}
          onSaved={() => { setEditModal(null); load(); showNotif('success', 'Réservation modifiée.') }}
        />
      )}
      {histModal && (
        <HistoriqueModal
          name={histModal.name}
          phone={histModal.phone}
          token={getToken()}
          onClose={() => setHistModal(null)}
        />
      )}
      {confirmDeleteOpen && (
        <ConfirmDialog
          message={`Supprimer définitivement ${selected.size} réservation(s) ?`}
          onConfirm={() => { setConfirmDeleteOpen(false); deleteSelected() }}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Taxi size={24} weight="bold" className="shrink-0" />
          Réservations
        </h1>
        <div className="flex items-center gap-2">
          <a href="/booking" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Nouvelle course</span>
            <span className="sm:hidden">Nouveau</span>
          </a>
          <button onClick={load}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0">
            <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total',      count: stats.total,      color: 'text-slate-900 dark:text-white' },
          { label: 'En attente', count: stats.en_attente, color: 'text-yellow-700 dark:text-yellow-400' },
          { label: 'Confirmées', count: stats.confirmee,  color: 'text-blue-700 dark:text-blue-400' },
          { label: 'En route',   count: stats.en_route,   color: 'text-orange-700 dark:text-orange-400' },
          { label: 'Terminées',  count: stats.terminee,   color: 'text-green-700 dark:text-green-400' },
          { label: 'Annulées',   count: stats.annulee,    color: 'text-red-700 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-300 dark:border-slate-700 text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
            <div className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-300 dark:border-slate-700 space-y-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, n° résa..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent dark:placeholder-slate-400 dark:placeholder-slate-500 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Du</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-xs sm:text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Au</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-xs sm:text-sm" />
          </div>
          <button onClick={exportCsv}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <Export size={14} />
            Export CSV
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {['all', 'en_attente', 'confirmee', 'en_route', 'terminee', 'annulee'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{s === 'all' ? 'Toutes' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
          {selected.size > 0 && (
            <button onClick={() => setConfirmDeleteOpen(true)}
              className="ml-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
              <Trash size={16} />
              Supprimer ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading ? (
          <SkeletonList count={5} />
        ) : reservations.length === 0 ? (
          <EmptyState icon={<Taxi size={32} />} title={search ? 'Aucun résultat' : 'Aucune réservation'} subtitle={search ? 'Aucune résa ne correspond à la recherche.' : 'Les réservations apparaissent ici.'} />
        ) : (
          reservations.map(r => {
            const sc       = STATUS_CONFIG[r.status] || STATUS_CONFIG.en_attente
            const expanded = expandedId === r._id
            return (
              <div key={r._id} className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 overflow-hidden ${selected.has(r._id) ? 'ring-2 ring-blue-400' : ''}`}>
                <div className="p-3 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : r._id)}>
                  <input type="checkbox" checked={selected.has(r._id)}
                    onChange={e => { e.stopPropagation(); toggleSelect(r._id) }}
                    className="rounded border-slate-300 shrink-0 mt-1 sm:mt-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">{r.customer.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>{sc.label}</span>
                      {r.pricing.isForfait && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">Forfait</span>}
                      {isPast(r.pickupDate) && r.status === 'en_attente' && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Passée</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-xl sm:text-2xl leading-none tabular-nums">
                        {new Date(r.pickupDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        {new Date(r.pickupDate).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' })}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">{r.reservationId}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                      <a href={wazeUrl(addrStr(r.trip.from))} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-blue-600 transition-colors inline-flex items-center gap-0.5">
                        <MapPin size={14} className="inline text-green-500 shrink-0" /> {addrStr(r.trip.from).split(',')[0]}
                      </a>
                      <span className="mx-1">→</span>
                      <a href={wazeUrl(addrStr(r.trip.to))} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="hover:text-blue-600 transition-colors inline-flex items-center gap-0.5">
                        <MapPin size={14} className="inline text-red-500 shrink-0" /> {addrStr(r.trip.to).split(',')[0]}
                      </a>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 sm:hidden">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{r.trip.distance?.toFixed(1)} km</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">{formatPrix(r)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="text-lg font-bold text-green-700 dark:text-green-400">{formatPrix(r)}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{r.trip.distance?.toFixed(1)} km</div>
                  </div>
                  <CaretDown size={20} className={`text-slate-600 transition-transform shrink-0 hidden sm:block ${expanded ? 'rotate-180' : ''}`} />
                </div>

                {expanded && (
                  <div className="border-t border-slate-100 dark:border-slate-700 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-500 block text-xs">Téléphone</span>
                        <div className="flex items-center gap-1">
                          <a href={`tel:${r.customer.phone}`} className="text-blue-600 font-medium flex items-center gap-1">
                            <Phone size={14} /> {r.customer.phone}
                          </a>
                          <CopyButton text={r.customer.phone} />
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-500 block text-xs">Email</span>
                        {r.customer.email ? (
                          <a href={`mailto:${r.customer.email}`} className="text-blue-600 font-medium flex items-center gap-1 truncate">
                            <Envelope size={14} className="shrink-0" /> <span className="truncate">{r.customer.email}</span>
                          </a>
                        ) : <span className="text-slate-600 dark:text-slate-400 text-xs">Non renseigné</span>}
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-500 block text-xs">Passagers / Bagages</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{r.passengers} pass. / {r.luggage} bag.</span>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-500 block text-xs">Tarif</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{r.pricing.tariffType}</span>
                      </div>
                    </div>

                    <a
                      href={`/admin/clients?search=${encodeURIComponent(r.customer.phone)}`}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <AddressBook size={13} /> Voir fiche client
                    </a>

                    {r.notes && (
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400 text-xs">Notes client :</span>
                        <p className="text-slate-700">{r.notes}</p>
                      </div>
                    )}

                    <InlineAdminNote reservationId={r._id} initial={r.adminNotes || ''} />

                    <div className="text-xs text-slate-600 dark:text-slate-500 space-y-1">
                      <div className="flex items-start gap-1">
                        <span className="shrink-0">Départ :</span>
                        <a href={wazeUrl(addrStr(r.trip.from))} target="_blank" rel="noopener noreferrer" className="break-words text-blue-600 dark:text-blue-400 hover:underline">{addrStr(r.trip.from)}</a>
                        <CopyButton text={addrStr(r.trip.from)} className="shrink-0 -mt-0.5" />
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="shrink-0">Destination :</span>
                        <a href={wazeUrl(addrStr(r.trip.to))} target="_blank" rel="noopener noreferrer" className="break-words text-blue-600 dark:text-blue-400 hover:underline">{addrStr(r.trip.to)}</a>
                        <CopyButton text={addrStr(r.trip.to)} className="shrink-0 -mt-0.5" />
                      </div>
                      <div>Créée le {formatDate(r.createdAt)}</div>
                    </div>

                    {r.invoiceNumber && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-1.5">
                        <Receipt size={13} weight="bold" />
                        Facture <span className="font-bold">FAC-{r.invoiceNumber}</span> déjà générée
                      </div>
                    )}

                    {/* Statut — toujours visible */}
                    <div className="pt-2 border-t border-slate-300 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Statut</p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {r.status !== 'confirmee' && r.status !== 'en_route' && r.status !== 'terminee' && (
                          <button onClick={() => updateStatus(r._id, 'confirmee')}
                            className="shrink-0 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                            Confirmer
                          </button>
                        )}
                        {(r.status === 'confirmee' || r.status === 'en_attente') && (
                          <button onClick={() => updateStatus(r._id, 'en_route')}
                            className="shrink-0 px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1.5">
                            <NavigationArrow size={14} /> En route
                          </button>
                        )}
                        {r.status !== 'terminee' && r.status !== 'annulee' && (
                          <button onClick={() => updateStatus(r._id, 'terminee')}
                            className="shrink-0 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                            Terminer
                          </button>
                        )}
                        {r.status !== 'annulee' && r.status !== 'terminee' && (
                          <button onClick={() => updateStatus(r._id, 'annulee')}
                            className="shrink-0 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                            Annuler
                          </button>
                        )}
                        {(r.status === 'annulee' || r.status === 'terminee') && (
                          <button onClick={() => updateStatus(r._id, 'en_attente')}
                            className="shrink-0 px-3 py-2 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600 transition-colors">
                            Remettre en attente
                          </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); generateInvoice(r) }}
                          className="shrink-0 px-3 py-2 bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                          <Receipt size={14} /> Facture PDF
                        </button>
                      </div>
                    </div>

                    {/* Communications — déroulant */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={e => { e.stopPropagation(); toggleSection(`${r._id}-comm`) }}
                        className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        <span className="flex items-center gap-1.5"><DeviceMobile size={13} /> Communications</span>
                        <CaretDown size={13} className={`transition-transform duration-200 ${openSections.has(`${r._id}-comm`) ? 'rotate-180' : ''}`} />
                      </button>
                      {openSections.has(`${r._id}-comm`) && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mt-2">
                          <a
                            href={`sms:${r.customer.phone}?body=${encodeURIComponent(
                              `Bonjour ${r.customer.name.split(' ')[0]}, votre taxi est confirmé le ${new Date(r.pickupDate).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' })} à ${new Date(r.pickupDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })}, de ${addrStr(r.trip.from).split(',')[0]} → ${addrStr(r.trip.to).split(',')[0]}. À bientôt ! Taxi Bordeaux Solution +33 5 54 54 34 66`
                            )}`}
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                          >
                            <DeviceMobile size={14} /> Confirmation SMS
                          </a>
                          <a
                            href={`sms:${r.customer.phone}?body=${encodeURIComponent(`Bonjour ${r.customer.name.split(' ')[0]}, merci d'avoir choisi Taxi Bordeaux Solution ! Si vous êtes satisfait(e), un petit avis Google nous aiderait beaucoup 🙏\nhttps://g.page/r/CSgLIx6QFNEvEBM/review`)}`}
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                          >
                            <Star size={14} weight="fill" /> Avis SMS
                          </a>
                          {r.customer.email && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                if (window.confirm(`Envoyer une demande d'avis Google par email à ${r.customer.email} ?`)) sendReviewEmail(r)
                              }}
                              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                            >
                              <Envelope size={14} /> Avis Email
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Course — déroulant */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={e => { e.stopPropagation(); toggleSection(`${r._id}-course`) }}
                        className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        <span className="flex items-center gap-1.5"><Taxi size={13} /> Course</span>
                        <CaretDown size={13} className={`transition-transform duration-200 ${openSections.has(`${r._id}-course`) ? 'rotate-180' : ''}`} />
                      </button>
                      {openSections.has(`${r._id}-course`) && (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mt-2">
                          <a href={buildBookingUrl(r, false)} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                            <PlusCircle size={14} /> Nouvelle course
                          </a>
                          <a href={buildBookingUrl(r, true)} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                            <ArrowsLeftRight size={14} /> Créer retour
                          </a>
                          <button onClick={e => { e.stopPropagation(); setEditModal(r) }}
                            className="shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                            <PencilSimple size={14} /> Modifier
                          </button>
                          <button onClick={e => { e.stopPropagation(); setHistModal({ name: r.customer.name, phone: r.customer.phone }) }}
                            className="shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                            <UserList size={14} /> Historique
                          </button>
                        </div>
                      )}
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
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400 px-3">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
