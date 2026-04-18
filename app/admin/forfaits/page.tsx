'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Plus, PencilSimple, Trash, ToggleLeft, ToggleRight, ArrowClockwise, X, FloppyDisk, MapPin, Warning } from '@phosphor-icons/react'

const API = '/api'
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

interface LatLng { lat: number; lng: number }
interface Point { adresse: string; lat: number; lng: number; zone: LatLng[] }
interface Forfait {
  _id?: string
  nom: string
  pointA: Point
  pointB: Point
  prixJour: number
  prixNuit: number
  actif: boolean
}

const EMPTY_POINT: Point = { adresse: '', lat: 0, lng: 0, zone: [] }
const EMPTY: Forfait = { nom: '', pointA: EMPTY_POINT, pointB: EMPTY_POINT, prixJour: 0, prixNuit: 0, actif: true }

export default function AdminForfaits() {
  const [forfaits, setForfaits] = useState<Forfait[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Forfait | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const token = () => sessionStorage.getItem('admin_token') || ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/forfaits`, { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setForfaits(data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleActif = async (f: Forfait) => {
    await fetch(`${API}/admin/forfaits/${f._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ actif: !f.actif })
    })
    load()
  }

  const deleteForfait = async (id: string) => {
    setDeleting(id)
    await fetch(`${API}/admin/forfaits/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
    setDeleting(null)
    load()
  }

  const onSaved = () => { setEditing(null); load() }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <ArrowClockwise size={32} className="animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forfaits</h1>
          <p className="text-gray-500 text-sm mt-1">Prix fixes pour des trajets spécifiques</p>
        </div>
        <button
          onClick={() => setEditing(EMPTY)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl transition-colors shadow-lg"
        >
          <Plus size={20} />
          Nouveau forfait
        </button>
      </div>

      {message && (
        <div className={`rounded-2xl px-5 py-3 font-semibold text-sm ${
          message.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Liste */}
      {forfaits.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          Aucun forfait. Créez-en un !
        </div>
      ) : (
        <div className="space-y-3">
          {forfaits.map(f => (
            <div key={f._id} className={`bg-white rounded-2xl shadow-sm border ${f.actif ? 'border-gray-100' : 'border-gray-200 opacity-60'} p-5 flex items-center gap-4`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">{f.nom}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {f.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1 truncate">
                  <MapPin size={14} />
                  <span className="truncate">{f.pointA.adresse}</span>
                  <span className="mx-1">→</span>
                  <span className="truncate">{f.pointB.adresse}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-blue-700">Jour : {f.prixJour} €</div>
                <div className="text-sm font-semibold text-indigo-700">Nuit : {f.prixNuit} €</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActif(f)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Activer/Désactiver">
                  {f.actif ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                </button>
                <button onClick={() => setEditing(f)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors" title="Modifier">
                  <PencilSimple size={20} />
                </button>
                <button
                  onClick={() => deleteForfait(f._id!)}
                  disabled={deleting === f._id}
                  className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                  title="Supprimer"
                >
                  {deleting === f._id ? <ArrowClockwise size={20} className="animate-spin" /> : <Trash size={20} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire édition */}
      {editing && (
        <ForfaitForm
          initial={editing}
          token={token()}
          onSaved={onSaved}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ─── Formulaire d'ajout / édition avec carte ───────────────────────────────
function ForfaitForm({ initial, token, onSaved, onCancel }: {
  initial: Forfait
  token: string
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Forfait>(JSON.parse(JSON.stringify(initial)))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Carte & dessin
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [drawingManager, setDrawingManager] = useState<any>(null)
  const [activeZone, setActiveZone] = useState<'A' | 'B' | null>(null)
  const polygonsRef = useRef<{ A: any; B: any }>({ A: null, B: null })
  const markersRef = useRef<{ A: any; B: any }>({ A: null, B: null })
  const acRefA = useRef<HTMLInputElement>(null)
  const acRefB = useRef<HTMLInputElement>(null)

  const setField = (k: keyof Forfait, v: any) => setForm(p => ({ ...p, [k]: v }))
  const setPoint = (pt: 'pointA' | 'pointB', k: keyof Point, v: any) =>
    setForm(p => ({ ...p, [pt]: { ...p[pt], [k]: v } }))

  // Chargement Google Maps + Drawing
  useEffect(() => {
    const init = () => {
      const g = (window as any).google
      if (!g || !mapRef.current) return

      const m = new g.maps.Map(mapRef.current, {
        center: { lat: 44.8378, lng: -0.5792 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
      setMap(m)

      const dm = new g.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#3b82f6',
          fillOpacity: 0.25,
          strokeColor: '#2563eb',
          strokeWeight: 2,
          editable: true,
        }
      })
      dm.setMap(m)
      setDrawingManager(dm)

      // Écoute fin de dessin
      g.maps.event.addListener(dm, 'polygoncomplete', (polygon: any) => {
        if (!activeZoneRef.current) return
        const zone = activeZoneRef.current

        // Supprimer ancien polygone
        if (polygonsRef.current[zone]) polygonsRef.current[zone].setMap(null)
        polygonsRef.current[zone] = polygon

        // Extraire les points
        const pts: LatLng[] = polygon.getPath().getArray().map((ll: any) => ({ lat: ll.lat(), lng: ll.lng() }))
        setForm(p => ({
          ...p,
          [zone === 'A' ? 'pointA' : 'pointB']: {
            ...p[zone === 'A' ? 'pointA' : 'pointB'],
            zone: pts
          }
        }))

        // Repasser en mode nul après dessin
        dm.setDrawingMode(null)
      })

      // Autocomplete adresse A
      if (acRefA.current) {
        const acA = new g.maps.places.Autocomplete(acRefA.current, { componentRestrictions: { country: 'fr' } })
        acA.addListener('place_changed', () => {
          const place = acA.getPlace()
          if (!place.geometry) return
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          setForm(p => ({ ...p, pointA: { ...p.pointA, adresse: place.formatted_address, lat, lng } }))
          m.panTo({ lat, lng })
          if (markersRef.current.A) markersRef.current.A.setMap(null)
          markersRef.current.A = new g.maps.Marker({ map: m, position: { lat, lng }, label: 'A', title: 'Point A' })
        })
      }

      // Autocomplete adresse B
      if (acRefB.current) {
        const acB = new g.maps.places.Autocomplete(acRefB.current, { componentRestrictions: { country: 'fr' } })
        acB.addListener('place_changed', () => {
          const place = acB.getPlace()
          if (!place.geometry) return
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          setForm(p => ({ ...p, pointB: { ...p.pointB, adresse: place.formatted_address, lat, lng } }))
          if (markersRef.current.B) markersRef.current.B.setMap(null)
          markersRef.current.B = new g.maps.Marker({ map: m, position: { lat, lng }, label: 'B', title: 'Point B' })
        })
      }

      // Afficher zones existantes si édition
      if (initial.pointA.zone?.length > 2) {
        const poly = new g.maps.Polygon({
          paths: initial.pointA.zone,
          fillColor: '#3b82f6', fillOpacity: 0.25,
          strokeColor: '#2563eb', strokeWeight: 2, editable: true, map: m
        })
        polygonsRef.current.A = poly
      }
      if (initial.pointB.zone?.length > 2) {
        const poly = new g.maps.Polygon({
          paths: initial.pointB.zone,
          fillColor: '#ef4444', fillOpacity: 0.25,
          strokeColor: '#dc2626', strokeWeight: 2, editable: true, map: m
        })
        polygonsRef.current.B = poly
      }
      if (initial.pointA.lat) {
        markersRef.current.A = new g.maps.Marker({ map: m, position: { lat: initial.pointA.lat, lng: initial.pointA.lng }, label: 'A' })
      }
      if (initial.pointB.lat) {
        markersRef.current.B = new g.maps.Marker({ map: m, position: { lat: initial.pointB.lat, lng: initial.pointB.lng }, label: 'B' })
      }
    }

    const g = (window as any).google
    if (g?.maps?.drawing) {
      init()
      return
    }

    if (g?.maps) {
      // Maps déjà chargé sans la library drawing — la charger dynamiquement
      g.maps.importLibrary('drawing').then(() => init())
      return
    }

    const existing = document.querySelector('script[data-gmaps-admin]')
    if (existing) { existing.addEventListener('load', () => {
      (window as any).google.maps.importLibrary('drawing').then(() => init())
    }); return }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places,drawing`
    script.async = true
    script.dataset.gmapsAdmin = '1'
    script.onload = init
    document.head.appendChild(script)
  }, [])

  // Ref pour la zone active dans le listener (évite closure stale)
  const activeZoneRef = useRef<'A' | 'B' | null>(null)
  useEffect(() => { activeZoneRef.current = activeZone }, [activeZone])

  const startDraw = (zone: 'A' | 'B') => {
    if (!drawingManager) return
    setActiveZone(zone)
    const g = (window as any).google
    // Changer la couleur selon la zone
    drawingManager.setOptions({
      polygonOptions: {
        fillColor: zone === 'A' ? '#3b82f6' : '#ef4444',
        fillOpacity: 0.25,
        strokeColor: zone === 'A' ? '#2563eb' : '#dc2626',
        strokeWeight: 2,
        editable: true,
      }
    })
    drawingManager.setDrawingMode(g.maps.drawing.OverlayType.POLYGON)
  }

  const clearZone = (zone: 'A' | 'B') => {
    if (polygonsRef.current[zone]) {
      polygonsRef.current[zone].setMap(null)
      polygonsRef.current[zone] = null
    }
    const pt = zone === 'A' ? 'pointA' : 'pointB'
    setForm(p => ({ ...p, [pt]: { ...p[pt], zone: [] } }))
  }

  const save = async () => {
    if (!form.nom || !form.pointA.adresse || !form.pointB.adresse || !form.prixJour || !form.prixNuit) {
      setError('Remplissez tous les champs obligatoires')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = form._id ? `${API}/admin/forfaits/${form._id}` : `${API}/admin/forfaits`
      const method = form._id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!data.success) { setError('Erreur lors de la sauvegarde'); return }
      onSaved()
    } catch {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{form._id ? 'Modifier le forfait' : 'Nouveau forfait'}</h2>
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <X size={22} />
        </button>
      </div>

      {/* Nom */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du forfait *</label>
        <input
          type="text"
          value={form.nom}
          onChange={e => setField('nom', e.target.value)}
          placeholder="Ex: Gare Saint-Jean ↔ Aéroport Mérignac"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Points A et B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(['A', 'B'] as const).map(z => {
          const pt = z === 'A' ? 'pointA' : 'pointB'
          const color = z === 'A' ? 'blue' : 'red'
          const hasZone = form[pt].zone?.length > 2
          return (
            <div key={z} className={`border-2 rounded-2xl p-4 space-y-3 ${z === 'A' ? 'border-blue-200 bg-blue-50/30' : 'border-red-200 bg-red-50/30'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${z === 'A' ? 'bg-blue-600' : 'bg-red-500'}`}>{z}</div>
                <span className="font-semibold text-gray-700">Point {z}</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Adresse *</label>
                <input
                  ref={z === 'A' ? acRefA : acRefB}
                  type="text"
                  defaultValue={form[pt].adresse}
                  placeholder="Tapez une adresse..."
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startDraw(z)}
                  className={`flex-1 text-sm font-semibold py-2 px-3 rounded-xl border-2 transition-colors ${
                    z === 'A'
                      ? 'border-blue-400 text-blue-700 hover:bg-blue-100'
                      : 'border-red-400 text-red-700 hover:bg-red-100'
                  } ${activeZone === z ? 'ring-2 ring-offset-1 ' + (z === 'A' ? 'ring-blue-400' : 'ring-red-400') : ''}`}
                >
                  {activeZone === z ? 'Dessinez sur la carte...' : `Dessiner zone ${z}`}
                </button>
                {hasZone && (
                  <button
                    type="button"
                    onClick={() => clearZone(z)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50"
                    title="Effacer la zone"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {hasZone && (
                <p className="text-xs text-green-600 font-medium">
                  Zone dessinée — {form[pt].zone.length} points
                </p>
              )}
              {!hasZone && form[pt].lat !== 0 && (
                <p className="text-xs text-gray-400">
                  Rayon 500 m autour du point (par défaut)
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Carte */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Warning size={16} className="text-yellow-500" />
          Sélectionnez d'abord les adresses, puis cliquez sur "Dessiner zone" et tracez un polygone sur la carte.
        </div>
        <div ref={mapRef} className="w-full h-80 rounded-2xl border-2 border-gray-200 overflow-hidden" />
      </div>

      {/* Prix */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Prix jour (€) *</label>
          <input
            type="number" step="0.5" min="0"
            value={form.prixJour}
            onChange={e => setField('prixJour', parseFloat(e.target.value) || 0)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Prix nuit (€) *</label>
          <input
            type="number" step="0.5" min="0"
            value={form.prixNuit}
            onChange={e => setField('prixNuit', parseFloat(e.target.value) || 0)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Actif */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setField('actif', !form.actif)}
          className={`w-12 h-6 rounded-full transition-colors ${form.actif ? 'bg-green-500' : 'bg-gray-300'} relative`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.actif ? 'translate-x-7' : 'translate-x-1'}`} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{form.actif ? 'Actif' : 'Inactif'}</span>
      </label>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-6 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-8 py-3 rounded-2xl transition-colors shadow-lg"
        >
          <FloppyDisk size={20} />
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
