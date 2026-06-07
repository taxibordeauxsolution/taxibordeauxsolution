'use client'

import { useEffect, useState } from 'react'
import { IdentificationCard, FloppyDisk } from '@phosphor-icons/react'
import { getToken } from '@/app/admin/lib/token'
import { useToast } from '@/app/admin/components/Toast'

interface FormState {
  nomEntreprise: string; adresse: string; telephone: string
  emailFacturation: string; siret: string; numeroTva: string
  formeJuridique: string; capitalSocial: string; iban: string
  conditionsPaiement: string
}

const DEFAULTS: FormState = {
  nomEntreprise:      'Taxi Bordeaux Solution',
  adresse:            'Sainte-Eulalie, 33560',
  telephone:          '+33 6 67 23 78 22',
  emailFacturation:   'contact@taxibordeauxsolution.fr',
  siret:              '987 573 128 00012',
  numeroTva:          '',
  formeJuridique:     '',
  capitalSocial:      '',
  iban:               '',
  conditionsPaiement: 'Paiement comptant',
}

const FIELDS: { key: keyof FormState; label: string; placeholder: string; note?: string }[] = [
  { key: 'nomEntreprise',      label: 'Nom / Raison sociale',             placeholder: DEFAULTS.nomEntreprise },
  { key: 'formeJuridique',     label: 'Forme juridique',                  placeholder: 'Auto-entrepreneur, SARL, SAS…' },
  { key: 'capitalSocial',      label: 'Capital social',                   placeholder: 'ex : 1 000 €  (laisser vide si non applicable)' },
  { key: 'adresse',            label: 'Adresse',                          placeholder: DEFAULTS.adresse },
  { key: 'telephone',          label: 'Téléphone',                        placeholder: DEFAULTS.telephone },
  { key: 'emailFacturation',   label: 'Email facturation',                placeholder: DEFAULTS.emailFacturation },
  { key: 'siret',              label: 'SIRET',                            placeholder: DEFAULTS.siret },
  { key: 'numeroTva',          label: 'N° TVA intracommunautaire',        placeholder: 'ex : FR12987573128  (laisser vide si micro-entreprise)' },
  { key: 'iban',               label: 'IBAN (virement)',                  placeholder: 'ex : FR76 XXXX XXXX XXXX XXXX XXXX XXX' },
  { key: 'conditionsPaiement', label: 'Conditions de paiement',           placeholder: 'Paiement comptant' },
]

export default function ProfilPage() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [form, setForm]   = useState<FormState>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const { toast } = useToast()


  useEffect(() => {
    fetch('/api/admin/profil', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setUserName(j.data.name || '')
          setUserEmail(j.data.email || '')
          const d = j.data
          setForm({
            nomEntreprise:      d.nomEntreprise      || DEFAULTS.nomEntreprise,
            adresse:            d.adresse            || DEFAULTS.adresse,
            telephone:          d.telephone          || DEFAULTS.telephone,
            emailFacturation:   d.emailFacturation   || DEFAULTS.emailFacturation,
            siret:              d.siret              || DEFAULTS.siret,
            numeroTva:          d.numeroTva          || '',
            formeJuridique:     d.formeJuridique     || '',
            capitalSocial:      d.capitalSocial      || '',
            iban:               d.iban               || '',
            conditionsPaiement: d.conditionsPaiement || DEFAULTS.conditionsPaiement,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) toast('Profil de facturation sauvegardé', 'success')
      else toast(json.message || 'Erreur', 'error')
    } catch { toast('Erreur réseau', 'error') }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-slate-600">Chargement...</div>

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <IdentificationCard size={24} weight="bold" />
        Mon profil de facturation
      </h1>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
        Connecté en tant que <span className="font-semibold text-slate-800 dark:text-white">{userName}</span> — {userEmail}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-300 dark:border-slate-700 p-5 space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-500">Ces informations apparaissent dans l'en-tête de vos factures PDF. Les champs optionnels peuvent rester vides.</p>

        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
            <input
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
          </div>
        ))}



        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <FloppyDisk size={16} weight="bold" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
