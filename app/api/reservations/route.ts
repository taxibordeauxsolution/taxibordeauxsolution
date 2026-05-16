import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { connectDB, Reservation } from '@/app/lib/mongodb'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const { reservationId, customer, trip, pricing, bookingDetails, pickupDate, status } = body
    const tripFrom = typeof trip?.from === 'object' ? trip.from.address : trip?.from
    const tripTo = typeof trip?.to === 'object' ? trip.to.address : trip?.to

    if (!reservationId || !customer?.name || !customer?.phone || !tripFrom || !tripTo || !pickupDate) {
      return NextResponse.json({ success: false, message: 'Champs requis manquants' }, { status: 400 })
    }

    if (customer.name.toLowerCase().includes('testprice')) {
      return NextResponse.json({ success: true, test: true }, { status: 200 })
    }

    const isLeadCapture = status === 'lead_capture'

    const reservation = await Reservation.create({
      reservationId,
      status: isLeadCapture ? 'lead_capture' : 'en_attente',
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
      },
      trip: {
        from: tripFrom,
        to: tripTo,
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

    if (isLeadCapture) {
      const pickupDateObj = new Date(pickupDate)
      const dateStr = pickupDateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
      const heureStr = pickupDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      const prix = pricing?.totalPrice ? `${pricing.totalPrice.toFixed(2)}€` : 'Non calculé'
      const adminUrl = `https://taxibordeauxsolution.fr/admin/reservations`

      const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
      resend.emails.send({
        from: fromEmail,
        to: ['contact@taxibordeauxsolution.fr'],
        replyTo: 'contact@taxibordeauxsolution.fr',
        subject: `Nouveau lead à rappeler — ${tripFrom.split(',')[0]} → ${tripTo.split(',')[0]}`,
        html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f5;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
  <tr><td style="background:#7c3aed;padding:20px 32px;text-align:center">
    <h1 style="margin:0;font-size:18px;color:#fff;font-weight:600">Nouveau lead à rappeler</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9"><strong>Prénom :</strong> ${customer.name}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9"><strong>Téléphone :</strong> <a href="tel:${customer.phone}" style="color:#2563eb">${customer.phone}</a></td></tr>
      ${customer.email ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9"><strong>Email :</strong> <a href="mailto:${customer.email}" style="color:#2563eb">${customer.email}</a></td></tr>` : ''}
      <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9"><strong>Trajet :</strong> ${tripFrom.split(',')[0]} → ${tripTo.split(',')[0]}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9"><strong>Distance :</strong> ${(trip.distance || 0).toFixed(1)} km</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9"><strong>Date souhaitée :</strong> ${dateStr} à ${heureStr}</td></tr>
      <tr><td style="padding:8px 0"><strong>Prix estimé :</strong> ${prix}</td></tr>
    </table>
    <div style="text-align:center;margin-top:24px">
      <a href="${adminUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Voir dans l'admin</a>
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`,
      }).catch(() => {})
    }

    // Google Calendar — pas pour les leads, seulement les vraies réservations
    let googleEventId = ''
    const gcalRefreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
    const gcalClientId = process.env.GOOGLE_CLIENT_ID
    const gcalClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const gcalCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'


    if (!isLeadCapture && gcalRefreshToken && gcalClientId && gcalClientSecret) {
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
              `Départ : ${tripFrom}`,
              `Destination : ${tripTo}`,
              `Distance : ${trip.distance?.toFixed(1)} km`,
              '',
              `Prix : ${prix}`,
              `Passagers : ${bookingDetails?.passengers || 1}`,
              `Bagages : ${bookingDetails?.luggage || 0}`,
              bookingDetails?.notes ? `Notes : ${bookingDetails.notes}` : '',
            ].filter(Boolean).join('\n'),
            start: { dateTime: pickup.toISOString(), timeZone: 'Europe/Paris' },
            end: { dateTime: end.toISOString(), timeZone: 'Europe/Paris' },
            reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 1440 }, { method: 'popup', minutes: 60 }] },
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
