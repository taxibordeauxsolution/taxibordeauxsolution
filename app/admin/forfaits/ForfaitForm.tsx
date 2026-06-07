'use client'

import { useEffect, useRef, useState } from 'react'
import { X, FloppyDisk, Warning } from '@phosphor-icons/react'

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCarUqBqL2yuEy36eOw4JNatmclfOhOGs0'
const API = '/api'

export interface LatLng { lat: number; lng: number }
export interface Point { adresse: string; lat: number; lng: number; zone: LatLng[] }
export interface Forfait {
  _id?: string
  nom: string
  pointA: Point
  pointB: Point
  prixJour: number
  prixNuit: number
  actif: boolean
}

export default function ForfaitForm({ initial, token, onSaved, onCancel }: {
  initial: Forfait
  token: string
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Forfait>(JSON.parse(JSON.stringify(initial)))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [drawingManager, setDrawingManager] = useState<any>(null)
  const [activeZone, setActiveZone] = useState<'A' | 'B' | null>(null)
  const polygonsRef = useRef<{ A: any; B: any }>({ A: null, B: null })
  const markersRef = useRef<{ A: any; B: any }>({ A: null, B: null })
  const acRefA = useRef<HTMLInputElement>(null)
  const acRefB = useRef<HTMLInputElement>(null)
  const activeZoneRef = useRef<'A' | 'B' | null>(null)

  const setField = (k: keyof Forfait, v: any) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => { activeZoneRef.current = activeZone }, [activeZone])

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
        polygonOptions: { fillColor: '#3b82f6', fillOpacity: 0.25, strokeColor: '#2563eb', strokeWeight: 2, editable: true }
      })
      dm.setMap(m)
      setDrawingManager(dm)

      g.maps.event.addListener(dm, 'polygoncomplete', (polygon: any) => {
        if (!activeZoneRef.current) return
        const zone = activeZoneRef.current
        if (polygonsRef.current[zone]) polygonsRef.current[zone].setMap(null)
        polygonsRef.current[zone] = polygon
        const pts: LatLng[] = polygon.getPath().getArray().map((ll: any) => ({ lat: ll.lat(), lng: ll.lng() }))
        setForm(p => ({
          ...p,
          [zone === 'A' ? 'pointA' : 'pointB']: { ...p[zone === 'A' ? 'pointA' : 'pointB'], zone: pts }
        }))
        dm.setDrawingMode(null)
      })

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

      if (initial.pointA.zone?.length > 2) {
        polygonsRef.current.A = new g.maps.Polygon({ paths: initial.pointA.zone, fillColor: '#3b82f6', fillOpacity: 0.25, strokeColor: '#2563eb', strokeWeight: 2, editable: true, map: m })
      }
      if (initial.pointB.zone?.length > 2) {
        polygonsRef.current.B = new g.maps.Polygon({ paths: initial.pointB.zone, fillColor: '#ef4444', fillOpacity: 0.25, strokeColor: '#dc2626', strokeWeight: 2, editable: true, map: m })
      }
      if (initial.pointA.lat) markersRef.current.A = new g.maps.Marker({ map: m, position: { lat: initial.pointA.lat, lng: initial.pointA.lng }, label: 'A' })
      if (initial.pointB.lat) markersRef.current.B = new g.maps.Marker({ map: m, position: { lat: initial.pointB.lat, lng: initial.pointB.lng }, label: 'B' })
    }

    const g = (window as any).google
    if (g?.maps?.drawing) { init(); return }

    // Maps chargé sans la library drawing (ex: chargé par la page booking) — forcer le rechargement
    if (g?.maps) {
      const old = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
      if (old) old.remove()
      delete (window as any).google
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&v=3.64&libraries=places,drawing`
    script.async = true
    script.onload = init
    document.head.appendChild(script)
  }, [])

  const startDraw = (zone: 'A' | 'B') => {
    if (!drawingManager) return
    setActiveZone(zone)
    const g = (window as any).google
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
    if (polygonsRef.current[zone]) { polygonsRef.current[zone].setMap(null); polygonsRef.current[zone] = null }
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
      const res = await fetch(url, {
        method: form._id ? 'PUT' : 'POST',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-700 p-6 sm:p-8 space-y-6 w-full max-w-2xl my-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{form._id ? 'Modifier le forfait' : 'Nouveau forfait'}</h2>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-slate-400"><X size={22} /></button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Nom du forfait *</label>
          <input type="text" value={form.nom} onChange={e => setField('nom', e.target.value)} placeholder="Ex: Gare Saint-Jean ↔ Aéroport Mérignac"
            className="w-full border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(['A', 'B'] as const).map(z => {
            const pt = z === 'A' ? 'pointA' : 'pointB'
            const hasZone = form[pt].zone?.length > 2
            return (
              <div key={z} className={`border-2 rounded-2xl p-4 space-y-3 ${z === 'A' ? 'border-blue-200 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-900/20' : 'border-red-200 bg-red-50/30 dark:border-red-900/40 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold ${z === 'A' ? 'bg-blue-600' : 'bg-red-500'}`}>{z}</div>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">Point {z}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Adresse *</label>
                  <input ref={z === 'A' ? acRefA : acRefB} type="text" defaultValue={form[pt].adresse} placeholder="Tapez une adresse..."
                    className="w-full border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-xl px-3 py-2 focus:border-blue-500 focus:outline-none text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => startDraw(z)}
                    className={`flex-1 text-sm font-semibold py-2 px-3 rounded-xl border-2 transition-colors ${z === 'A' ? 'border-blue-400 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30' : 'border-red-400 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'} ${activeZone === z ? 'ring-2 ring-offset-1 ' + (z === 'A' ? 'ring-blue-400' : 'ring-red-400') : ''}`}>
                    {activeZone === z ? 'Dessinez sur la carte...' : `Dessiner zone ${z}`}
                  </button>
                  {hasZone && (
                    <button type="button" onClick={() => clearZone(z)} className="text-gray-600 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20" transition-colors title="Effacer">
                      <X size={16} />
                    </button>
                  )}
                </div>
                {hasZone && <p className="text-xs text-green-600 dark:text-green-400 font-medium">Zone dessinée — {form[pt].zone.length} points</p>}
                {!hasZone && form[pt].lat !== 0 && <p className="text-xs text-gray-600 dark:text-slate-500">Rayon 500 m autour du point (par défaut)</p>}
              </div>
            )
          })}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Warning size={16} className="text-yellow-500" />
            Sélectionnez d'abord les adresses, puis cliquez sur "Dessiner zone" et tracez un polygone sur la carte.
          </div>
          <div ref={mapRef} className="w-full h-80 rounded-2xl border-2 border-gray-300 dark:border-slate-600 overflow-hidden" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Prix jour (€) *</label>
            <input type="text" inputMode="decimal" value={form.prixJour || ''} onChange={e => setField('prixJour', parseFloat(e.target.value) || 0)} placeholder="0"
              className="w-full border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Prix nuit (€) *</label>
            <input type="text" inputMode="decimal" value={form.prixNuit || ''} onChange={e => setField('prixNuit', parseFloat(e.target.value) || 0)} placeholder="0"
              className="w-full border-2 border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-gray-900 bg-white dark:text-slate-100 dark:bg-transparent rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setField('actif', !form.actif)} className={`w-12 h-6 rounded-full transition-colors ${form.actif ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'} relative`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.actif ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{form.actif ? 'Actif' : 'Inactif'}</span>
        </label>

        {error && <p className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-slate-600 font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Annuler</button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-2xl transition-colors shadow-lg">
            <FloppyDisk size={20} />
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
