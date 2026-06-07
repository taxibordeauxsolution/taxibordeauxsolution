'use client'

import { useEffect, useState } from 'react'
import { ArrowClockwise, Trash, Plus, EnvelopeSimple, User, Lock, UsersThree } from '@phosphor-icons/react'
import { getToken } from '@/app/admin/lib/token'
import { useToast } from '@/app/admin/components/Toast'
import { ConfirmDialog } from '@/app/admin/components/ConfirmDialog'
import { EmptyState } from '@/app/admin/components/EmptyState'

interface AdminUser {
  _id: string
  email: string
  name: string
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; email: string } | null>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const json = await res.json()
      if (json.success) setUsers(json.data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ email, password, name })
      })
      const json = await res.json()
      if (json.success) {
        toast(`Compte créé pour ${email}`, 'success')
        setName(''); setEmail(''); setPassword('')
        setShowForm(false)
        load()
      } else {
        toast(json.message, 'error')
      }
    } catch (err: any) {
      toast(err.message, 'error')
    }
    setSaving(false)
  }

  const deleteUser = async (id: string, userEmail: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id })
      })
      const json = await res.json()
      if (json.success) { toast(`Compte ${userEmail} supprimé`, 'success'); load() }
      else toast(json.message, 'error')
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      {confirmDelete && (
        <ConfirmDialog
          message={`Supprimer le compte ${confirmDelete.email} ?`}
          onConfirm={() => { const d = confirmDelete; setConfirmDelete(null); deleteUser(d.id, d.email) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User size={24} weight="bold" className="shrink-0" />
          Comptes admin
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
          <button onClick={load}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0">
            <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addUser} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 sm:p-6 space-y-4 animate-modal-in">
          <h2 className="font-bold text-slate-800 dark:text-white">Nouveau compte admin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nom</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Prénom ou pseudo" required
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="partenaire@email.fr" required
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="text" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="6 caractères min." required minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Annuler
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Création...' : 'Créer le compte'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-600">Chargement...</div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<UsersThree size={32} />}
            title="Aucun compte admin"
            subtitle="Créez des comptes pour accéder à l'administration."
            action={
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={16} /> Ajouter un compte
              </button>
            }
          />
        ) : (
          users.map(u => (
            <div key={u._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shrink-0">
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-600 dark:text-slate-500 hidden sm:block">
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </span>
                {users.length > 1 && (
                  <button onClick={() => setConfirmDelete({ id: u._id, email: u.email })}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
