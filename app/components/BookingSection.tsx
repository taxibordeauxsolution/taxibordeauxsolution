'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const TaxiBookingHomePreview = dynamic(
  () => import('./TaxiBookingHomePreview'),
  { ssr: false }
)

const Placeholder = () => (
  <div className="min-h-[600px] bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm font-medium">Chargement du formulaire…</span>
  </div>
)

export default function BookingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // commence à charger 200px avant d'entrer dans le viewport
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {visible ? <TaxiBookingHomePreview /> : <Placeholder />}
    </div>
  )
}
