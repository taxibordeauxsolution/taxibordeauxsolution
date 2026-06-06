'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowClockwise, Trash, Phone, Envelope, MapPin, MagnifyingGlass, Plus, FloppyDisk, X, PencilSimple, CaretLeft, CaretRight, AddressBook, DownloadSimple } from '@phosphor-icons/react'
import { getToken } from '@/app/admin/lib/token'
import { SkeletonList } from '@/app/admin/components/Skeleton'
import { ConfirmDialog } from '@/app/admin/components/ConfirmDialog'
import { CopyButton } from '@/app/admin/components/CopyButton'

interface ClientData {
  _id: string
  nom: string
  telephone: string
  email: string
  adresse: string
  notes: string
  createdAt: string
  updatedAt: string
}

const emptyClient = { nom: '', telephone: '', email: '', adresse: '', notes: '' }

export default function AdminClients() {
  const [clients, setClients] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyClient)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmImportOpen, setConfirmImportOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/clients?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const json = await res.json()
      if (json.success) {
        setClients(json.data)
        setTotal(json.pagination.total)
        setTotalPages(json.pagination.totalPages)
      }
    } catch (e) { console.error('Erreur chargement clients:', e) }
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])

  useEffect(() => { setPage(1) }, [search])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyClient)
    setShowForm(true)
    setMessage(null)
  }

  const openEdit = (c: ClientData) => {
    setEditingId(c._id)
    setForm({ nom: c.nom, telephone: c.telephone, email: c.email, adresse: c.adresse, notes: c.notes })
    setShowForm(true)
    setMessage(null)
  }

  const save = async () => {
    if (!form.nom.trim() || !form.telephone.trim()) {
      setMessage({ type: 'err', text: 'Nom et téléphone obligatoires' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...form } : form
      const res = await fetch('/api/admin/clients', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (json.success) {
        setMessage({ type: 'ok', text: editingId ? 'Client modifié' : 'Client ajouté' })
        setShowForm(false)
        load()
      } else {
        setMessage({ type: 'err', text: json.message || 'Erreur' })
      }
    } catch (e: any) {
      setMessage({ type: 'err', text: e.message })
    }
    setSaving(false)
  }

  const importFromResas = async () => {
    setImporting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/clients/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const json = await res.json()
      if (json.success) {
        setMessage({ type: 'ok', text: `Import terminé — ${json.created} créés · ${json.updated} mis à jour · ${json.skipped} ignorés (sur ${json.total} réservations)` })
        load()
      } else {
        setMessage({ type: 'err', text: json.message || 'Erreur import' })
      }
    } catch (e: any) {
      setMessage({ type: 'err', text: e.message })
    }
    setImporting(false)
  }

  const deleteClient = async (id: string) => {
    await fetch('/api/admin/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ids: [id] })
    })
    load()
  }

  return (
    <div className="space-y-6">
      {confirmDeleteId && (
        <ConfirmDialog
          message="Supprimer ce client définitivement ?"
          onConfirm={() => { const id = confirmDeleteId; setConfirmDeleteId(null); deleteClient(id) }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {confirmImportOpen && (
        <ConfirmDialog
          message="Importer tous les clients depuis les réservations ? Les doublons (même téléphone) seront ignorés."
          onConfirm={() => { setConfirmImportOpen(false); importFromResas() }}
          onCancel={() => setConfirmImportOpen(false)}
          confirmLabel="Importer"
          danger={false}
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AddressBook size={24} weight="bold" className="text-blue-600 shrink-0" />
          Clients ({total})
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setConfirmImportOpen(true)} disabled={importing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors shrink-0">
            <DownloadSimple size={16} className={importing ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline">{importing ? 'Import...' : 'Importer résas'}</span>
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">Nouveau client</span>
          </button>
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0">
            <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl px-4 py-3 font-semibold text-sm ${message.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Formulaire ajout/édition */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-200 dark:border-slate-700 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-white">{editingId ? 'Modifier le client' : 'Nouveau client'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">Nom *</label>
              <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Nom complet" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">Téléphone *</label>
              <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="06 12 34 56 78" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="email@exemple.fr" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">Adresse</label>
              <input type="text" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Adresse du client" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-400 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Informations supplémentaires..." />
          </div>
          <div className="flex justify-end">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
              <FloppyDisk size={16} />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 rounded-lg text-sm focus:border-blue-500 focus:outline-none" />
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading ? (
          <SkeletonList count={5} />
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {search ? 'Aucun résultat' : 'Aucun client enregistré'}
          </div>
        ) : (
          clients.map(c => (
            <div key={c._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm shrink-0">
                  {c.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{c.nom}</div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1">
                      <a href={`tel:${c.telephone}`} className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:underline">
                        <Phone size={14} /> {c.telephone}
                      </a>
                      <CopyButton text={c.telephone} />
                    </div>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 hover:underline truncate">
                        <Envelope size={14} /> <span className="truncate">{c.email}</span>
                      </a>
                    )}
                    {c.adresse && (
                      <span className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1 truncate">
                        <MapPin size={12} /> <span className="truncate">{c.adresse}</span>
                      </span>
                    )}
                  </div>
                  {c.notes && (
                    <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg px-2 py-1">{c.notes}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(c)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-blue-600">
                    <PencilSimple size={16} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(c._id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
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
