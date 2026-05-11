import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ tollCost: 0 })
    }

    const { origin, destination } = await req.json()
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return NextResponse.json({ tollCost: 0 })
    }

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.travelAdvisory.tollInfo',
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
        travelMode: 'DRIVE',
        extraComputations: ['TOLLS'],
        routeModifiers: { vehicleInfo: { emissionType: 'GASOLINE' } },
      }),
    })

    const data = await res.json()

    const tollInfo = data?.routes?.[0]?.travelAdvisory?.tollInfo
    if (!tollInfo?.estimatedPrice?.length) {
      return NextResponse.json({ tollCost: 0 })
    }

    const price = tollInfo.estimatedPrice[0]
    const tollCost = parseFloat(price.units || '0') + (price.nanos || 0) / 1e9

    return NextResponse.json({ tollCost: Math.round(tollCost * 100) / 100 })
  } catch {
    return NextResponse.json({ tollCost: 0 })
  }
}
