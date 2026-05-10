import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Reservation } from '@/app/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const { reservationId, customer, trip, pricing, bookingDetails, pickupDate } = body
    if (!reservationId || !customer?.name || !customer?.phone || !trip?.from || !trip?.to || !pickupDate) {
      return NextResponse.json({ success: false, message: 'Champs requis manquants' }, { status: 400 })
    }

    // Ne pas enregistrer les tests
    if (customer.name.toLowerCase().includes('testprice')) {
      return NextResponse.json({ success: true, test: true }, { status: 200 })
    }

    const reservation = await Reservation.create({
      reservationId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
      },
      trip: {
        from: trip.from,
        to: trip.to,
        distance: trip.distance || 0,
      },
      pricing: {
        totalPrice: pricing?.totalPrice || 0,
        fourchette: pricing?.fourchette || null,
        tariffType: pricing?.priceDetails?.tariffType || 'Jour',
        isForfait: pricing?.priceDetails?.isForfait || false,
      },
      passengers: bookingDetails?.passengers || 1,
      luggage: bookingDetails?.luggage || 0,
      notes: bookingDetails?.notes || '',
      pickupDate: new Date(pickupDate),
    })

    // Google Calendar
    let googleEventId = ''
    const gcalRefreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
    const gcalClientId = process.env.GOOGLE_CLIENT_ID
    const gcalClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const gcalCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    console.log('Google Calendar config:', { hasRefresh: !!gcalRefreshToken, hasClient: !!gcalClientId, hasSecret: !!gcalClientSecret })

    if (gcalRefreshToken && gcalClientId && gcalClientSecret) {
      try {
        // Get access token from refresh token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: gcalClientId,
            client_secret: gcalClientSecret,
            refresh_token: gcalRefreshToken,
            grant_type: 'refresh_token',
          }),
        })
        const tokenData = await tokenRes.json()

        if (tokenData.access_token) {
          const pickup = new Date(pickupDate)
          const end = new Date(pickup.getTime() + (trip.distance > 50 ? 90 : 45) * 60000)

          const prix = pricing?.fourchette
            ? `${pricing.fourchette.de?.toFixed(2)}€ à ${pricing.fourchette.a?.toFixed(2)}€`
            : `${(pricing?.totalPrice || 0).toFixed(2)}€`

          const event = {
            summary: `🚖 ${customer.name} — ${reservationId}`,
            description: [
              `Client : ${customer.name}`,
              `Tel : ${customer.phone}`,
              customer.email ? `Email : ${customer.email}` : '',
              '',
              `Départ : ${trip.from}`,
              `Destination : ${trip.to}`,
              `Distance : ${trip.distance?.toFixed(1)} km`,
              '',
              `Prix : ${prix}`,
              `Passagers : ${bookingDetails?.passengers || 1}`,
              `Bagages : ${bookingDetails?.luggage || 0}`,
              bookingDetails?.notes ? `Notes : ${bookingDetails.notes}` : '',
            ].filter(Boolean).join('\n'),
            start: { dateTime: pickup.toISOString(), timeZone: 'Europe/Paris' },
            end: { dateTime: end.toISOString(), timeZone: 'Europe/Paris' },
            reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }] },
          }

          const calRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcalCalendarId)}/events`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(event),
            }
          )
          const calData = await calRes.json()
          if (calData.id) {
            googleEventId = calData.id
            await Reservation.findByIdAndUpdate(reservation._id, { googleEventId })
          }
        }
      } catch { }
    }

    return NextResponse.json({ success: true, id: reservation._id, googleEventId }, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) {
      return NextResponse.json({ success: false, message: 'Réservation déjà existante' }, { status: 409 })
    }
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
