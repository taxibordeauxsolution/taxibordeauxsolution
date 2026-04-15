'use client'

import dynamic from 'next/dynamic'

const TaxiBookingHomePreview = dynamic(
  () => import('./TaxiBookingHomePreview'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export default function BookingSection() {
  return <TaxiBookingHomePreview />
}
