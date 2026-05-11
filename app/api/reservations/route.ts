import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { connectDB, Reservation } from '@/app/lib/mongodb'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
const ADMIN_EMAIL = process.env.RESEND_TO_EMAIL || 'contact@taxibordeauxsolution.fr'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const { reservationId, customer, trip, pricing, bookingDetails, pickupDate } = body
    const tripFrom = typeof trip?.from === 'object' ? trip.from.address : trip?.from
    const tripTo = typeof trip?.to === 'object' ? trip.to.address : trip?.to

    if (!reservationId || !customer?.name || !customer?.phone || !tripFrom || !tripTo || !pickupDate) {
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

    // Google Calendar
    let googleEventId = ''
    const gcalRefreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
    const gcalClientId = process.env.GOOGLE_CLIENT_ID
    const gcalClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const gcalCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'


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

    // Emails
    if (resend) {
      const pickup = new Date(pickupDate)
      const dateStr = pickup.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })

      const prix = pricing?.fourchette
        ? `${pricing.fourchette.de?.toFixed(2)}€ à ${pricing.fourchette.a?.toFixed(2)}€`
        : `${(pricing?.totalPrice || 0).toFixed(2)}€`

      const clientHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#1e293b">🚖 Confirmation de réservation</h2>
          <p>Bonjour <strong>${customer.name}</strong>,</p>
          <p>Votre réservation <strong>${reservationId}</strong> est bien enregistrée.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Départ</td><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>${tripFrom}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Destination</td><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>${tripTo}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Date</td><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>${dateStr}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Prix</td><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>${prix}</strong></td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Passagers</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${bookingDetails?.passengers || 1}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Bagages</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${bookingDetails?.luggage || 0}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Téléphone</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${customer.phone}</td></tr>
            ${bookingDetails?.notes ? `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b">Notes</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${bookingDetails.notes}</td></tr>` : ''}
          </table>
          <p>Merci de votre confiance !<br><strong>Taxi Bordeaux Solution</strong></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
          <p style="font-size:12px;color:#94a3b8">Besoin d'aide ? Contactez-nous au 06 67 23 78 22</p>
        </div>
      `

      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#1e293b">🚖 Nouvelle réservation ${reservationId}</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Client</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0"><strong>${customer.name}</strong></td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Tél</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${customer.phone}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Email</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${customer.email || '<span style="color:#ef4444;font-weight:bold">Non renseigné — penser à envoyer la confirmation par SMS</span>'}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Départ</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${tripFrom}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Destination</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${tripTo}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Date</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${dateStr}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Prix</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0"><strong>${prix}</strong></td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Passagers</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${bookingDetails?.passengers || 1}</td></tr>
            <tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Bagages</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${bookingDetails?.luggage || 0}</td></tr>
            ${bookingDetails?.notes ? `<tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#64748b">Notes</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${bookingDetails.notes}</td></tr>` : ''}
          </table>
        </div>
      `

      try {
        // Email admin (toujours)
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `Nouvelle résa ${reservationId} — ${customer.name}`,
          html: adminHtml,
        })

        // Email client (si email fourni)
        if (customer.email) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [customer.email],
            subject: `Confirmation réservation ${reservationId} — Taxi Bordeaux`,
            html: clientHtml,
          })
        } else {
          // Pas d'email client → envoyer sa version à l'admin aussi
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `Confirmation client ${reservationId} — ${customer.name} (pas d'email)`,
            html: clientHtml,
          })
        }
      } catch {}
    }

    return NextResponse.json({ success: true, id: reservation._id, googleEventId }, { status: 201 })
  } catch (e: any) {
    if (e.code === 11000) {
      return NextResponse.json({ success: false, message: 'Réservation déjà existante' }, { status: 409 })
    }
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
