'use client'

import { useEffect, useState } from 'react'
import { IdentificationCard, FloppyDisk, CheckCircle } from '@phosphor-icons/react'

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
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const token = () => sessionStorage.getItem('admin_token') || ''

  useEffect(() => {
    fetch('/api/admin/profil', { headers: { Authorization: `Bearer ${token()}` } })
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
    setSaving(true); setError(''); setSaved(false)
    try {
      const res  = await fetch('/api/admin/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError(json.message || 'Erreur')
    } catch { setError('Erreur réseau') }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-slate-400">Chargement...</div>

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <IdentificationCard size={24} weight="bold" />
        Mon profil de facturation
      </h1>

      <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-500">
        Connecté en tant que <span className="font-semibold text-slate-800">{userName}</span> — {userEmail}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
        <p className="text-xs text-slate-400">Ces informations apparaissent dans l'en-tête de vos factures PDF. Les champs optionnels peuvent rester vides.</p>

        {FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-medium text-slate-500">{label}</label>
            <input
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {saved
            ? <><CheckCircle size={16} weight="bold" /> Enregistré</>
            : <><FloppyDisk size={16} weight="bold" /> {saving ? 'Enregistrement...' : 'Enregistrer'}</>}
        </button>
      </div>
    </div>
  )
}
