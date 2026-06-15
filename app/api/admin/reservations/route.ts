import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { connectDB, Reservation, Client } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const search = searchParams.get('search')

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 500)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const skip = (page - 1) * limit

    const filter: any = {}
    if (status && status !== 'all') filter.status = status
    else filter.status = { $ne: 'lead_capture' }
    if (from || to) {
      filter.pickupDate = {}
      if (from) filter.pickupDate.$gte = new Date(from)
      if (to) filter.pickupDate.$lte = new Date(to + 'T23:59:59.999Z')
    }
    if (search) {
      const regex = { $regex: search, $options: 'i' }
      filter.$or = [
        { 'customer.name': regex },
        { 'customer.phone': regex },
        { 'customer.email': regex },
        { reservationId: regex },
      ]
    }

    const baseFilter: any = {}
    if (from || to) {
      baseFilter.pickupDate = filter.pickupDate
    }

    // Aggregation $facet : 1 seule query MongoDB pour les 7 compteurs au lieu de 7 séparées
    const [reservations, total, statsAgg] = await Promise.all([
      Reservation.find(filter).sort({ pickupDate: -1 }).skip(skip).limit(limit).lean(),
      Reservation.countDocuments(filter),
      Reservation.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ])

    const counts: Record<string, number> = {}
    for (const row of statsAgg as Array<{ _id: string; count: number }>) {
      counts[row._id] = row.count
    }

    const stats = {
      total: (counts.en_attente || 0) + (counts.confirmee || 0) + (counts.en_route || 0) + (counts.terminee || 0) + (counts.annulee || 0),
      en_attente: counts.en_attente || 0,
      confirmee: counts.confirmee || 0,
      en_route: counts.en_route || 0,
      terminee: counts.terminee || 0,
      annulee: counts.annulee || 0,
      lead_capture: counts.lead_capture || 0,
    }

    return NextResponse.json({ success: true, data: reservations, stats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const body = await req.json()
    const { customer, trip, pricing, passengers, luggage, notes, adminNotes, pickupDate } = body

    if (!customer?.name || !customer?.phone || !trip?.from || !trip?.to || !pickupDate) {
      return NextResponse.json({ success: false, message: 'Champs requis manquants' }, { status: 400 })
    }

    const rand = Math.floor(Math.random() * 9000) + 1000
    const reservationId = 'TBS-' + Date.now().toString().slice(-6) + '-' + rand

    const reservation = await Reservation.create({
      reservationId,
      status: 'en_attente',
      customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email?.trim() || '' },
      trip: { from: trip.from, to: trip.to, distance: trip.distance || 0 },
      pricing: {
        totalPrice: pricing?.totalPrice || 0,
        fourchette: pricing?.fourchette || null,
        tariffType: pricing?.tariffType || 'Jour',
        isForfait: pricing?.isForfait || false,
      },
      passengers: passengers || 1,
      luggage: luggage || 0,
      notes: notes || '',
      adminNotes: adminNotes || '',
      pickupDate: new Date(pickupDate),
    })

    // Google Calendar
    const gcalRefreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.replace(/^﻿/, '').trim()
    const gcalClientId = process.env.GOOGLE_CLIENT_ID?.replace(/^﻿/, '').trim()
    const gcalClientSecret = process.env.GOOGLE_CLIENT_SECRET?.replace(/^﻿/, '').trim()
    const gcalCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    if (gcalRefreshToken && gcalClientId && gcalClientSecret) {
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ client_id: gcalClientId, client_secret: gcalClientSecret, refresh_token: gcalRefreshToken, grant_type: 'refresh_token' }),
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
            description: [`Client : ${customer.name}`, `Tel : ${customer.phone}`, customer.email ? `Email : ${customer.email}` : '', '', `Départ : ${trip.from}`, `Destination : ${trip.to}`, `Distance : ${(trip.distance||0).toFixed(1)} km`, '', `Prix : ${prix}`, `Passagers : ${passengers||1}`, `Bagages : ${luggage||0}`, notes ? `Notes : ${notes}` : '', adminNotes ? `Notes admin : ${adminNotes}` : ''].filter(Boolean).join('\n'),
            start: { dateTime: pickup.toISOString(), timeZone: 'Europe/Paris' },
            end: { dateTime: end.toISOString(), timeZone: 'Europe/Paris' },
            reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 1440 }, { method: 'popup', minutes: 60 }] },
          }
          const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcalCalendarId)}/events`, {
            method: 'POST', headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          })
          const calData = await calRes.json()
          if (calData.id) await Reservation.findByIdAndUpdate(reservation._id, { googleEventId: calData.id })
        }
      } catch {}
    }

    // Auto-upsert client
    Client.updateOne(
      { telephone: customer.phone.trim() },
      { $setOnInsert: { nom: customer.name.trim(), telephone: customer.phone.trim(), email: (customer.email || '').toLowerCase().trim(), adresse: '', notes: '' } },
      { upsert: true }
    ).catch(() => {})

    return NextResponse.json({ success: true, id: reservation._id, reservationId }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const body = await req.json()
    const { id, status, totalPrice, editFull } = body
    if (!id) return NextResponse.json({ success: false }, { status: 400 })

    const update: any = {}

    if (editFull) {
      // Modification complète d'une réservation
      const { customer, trip, pricing, passengers, luggage, notes, adminNotes, pickupDate } = body
      if (customer?.name) update['customer.name'] = customer.name.trim()
      if (customer?.phone) update['customer.phone'] = customer.phone.trim()
      if (typeof customer?.email !== 'undefined') update['customer.email'] = customer.email?.trim() || ''
      if (trip?.from) update['trip.from'] = trip.from
      if (trip?.to) update['trip.to'] = trip.to
      if (typeof trip?.distance === 'number') update['trip.distance'] = trip.distance
      if (pickupDate) update.pickupDate = new Date(pickupDate)
      if (typeof passengers === 'number') update.passengers = passengers
      if (typeof luggage === 'number') update.luggage = luggage
      if (typeof notes !== 'undefined') update.notes = notes
      if (typeof adminNotes !== 'undefined') update.adminNotes = adminNotes
      if (typeof pricing?.totalPrice === 'number') {
        update['pricing.totalPrice'] = pricing.totalPrice
        update['pricing.fourchette'] = pricing.fourchette || null
        update['pricing.tariffType'] = pricing.tariffType || 'Jour'
        update['pricing.isForfait'] = pricing.isForfait || false
      }
    } else {
      if (status) update.status = status
      if (status === 'en_route') update.enRouteAt = new Date()
      if (typeof totalPrice === 'number' && totalPrice >= 0) {
        update['pricing.totalPrice'] = totalPrice
        update['pricing.fourchette'] = null
      }
      if (typeof body.adminNotes !== 'undefined') update.adminNotes = body.adminNotes
    }

    if (Object.keys(update).length === 0)
      return NextResponse.json({ success: false, message: 'Aucune modification' }, { status: 400 })

    const reservation = await Reservation.findByIdAndUpdate(id, update, { new: true })
    if (!reservation) return NextResponse.json({ success: false, message: 'Non trouvée' }, { status: 404 })

    // Email de notification de modification si demandé
    if (editFull && body.notifyClient && reservation.customer.email) {
      const fromAddr = typeof reservation.trip.from === 'string' ? reservation.trip.from : reservation.trip.from?.address || ''
      const toAddr   = typeof reservation.trip.to   === 'string' ? reservation.trip.to   : reservation.trip.to?.address   || ''
      const pickup   = new Date(reservation.pickupDate)
      const dateStr  = pickup.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
      const heureStr = pickup.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
      resend.emails.send({
        from: fromEmail, to: [reservation.customer.email],
        replyTo: 'contact@taxibordeauxsolution.fr',
        subject: `Modification de votre réservation N° ${reservation.reservationId} — Taxi Bordeaux Solution`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;background:#f4f4f5;margin:0;padding:0;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
  <tr><td style="background:#1e293b;padding:20px 32px;text-align:center"><h1 style="margin:0;font-size:18px;color:#fff;font-weight:600">Taxi Bordeaux Solution</h1></td></tr>
  <tr><td style="padding:32px">
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;text-align:center">Votre réservation a été modifiée</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;text-align:center">Bonjour ${reservation.customer.name}, voici les détails mis à jour de votre course.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:24px"><tr><td style="padding:16px">
      <div style="font-size:13px;color:#64748b;margin-bottom:4px">Réservation</div>
      <div style="font-size:15px;color:#1e293b;font-weight:600;margin-bottom:12px">N° ${reservation.reservationId}</div>
      <div style="font-size:13px;color:#64748b;margin-bottom:4px">Trajet</div>
      <div style="font-size:15px;color:#1e293b;font-weight:600;margin-bottom:12px">${fromAddr.split(',')[0]} → ${toAddr.split(',')[0]}</div>
      <div style="font-size:13px;color:#64748b;margin-bottom:4px">Date et heure</div>
      <div style="font-size:15px;color:#1e293b;font-weight:600">${dateStr} à ${heureStr}</div>
    </td></tr></table>
    <p style="text-align:center;font-size:13px;color:#64748b;margin:0">Questions ? <a href="tel:+33554543466" style="color:#1e293b;font-weight:600;text-decoration:none">+33 5 54 54 34 66</a></p>
  </td></tr>
  <tr><td style="padding:12px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#94a3b8">Taxi Bordeaux Solution · contact@taxibordeauxsolution.fr</td></tr>
</table></td></tr></table></body></html>`,
      }).catch(() => {})
    }

    let cancelEmailSent = false

    if (status === 'annulee') {
      // Suppression de l'événement Google Calendar
      const gcalRefreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.replace(/^﻿/, '').trim()
      const gcalClientId = process.env.GOOGLE_CLIENT_ID?.replace(/^﻿/, '').trim()
      const gcalClientSecret = process.env.GOOGLE_CLIENT_SECRET?.replace(/^﻿/, '').trim()
      const gcalCalendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

      if (reservation.googleEventId && gcalRefreshToken && gcalClientId && gcalClientSecret) {
        try {
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
            await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(gcalCalendarId)}/events/${encodeURIComponent(reservation.googleEventId)}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
              }
            )
            await Reservation.findByIdAndUpdate(id, { googleEventId: '' })
          }
        } catch {}
      }

      // Email d'annulation au client
      if (reservation.customer.email) {
        const fromAddr = typeof reservation.trip.from === 'string' ? reservation.trip.from : reservation.trip.from?.address || ''
        const toAddr = typeof reservation.trip.to === 'string' ? reservation.trip.to : reservation.trip.to?.address || ''
        const pickupDate = new Date(reservation.pickupDate)
        const heurePickup = pickupDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
        const datePickup = pickupDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f5;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
  <tr><td style="background:#1e293b;padding:20px 32px;text-align:center">
    <h1 style="margin:0;font-size:18px;color:#ffffff;font-weight:600">Taxi Bordeaux Solution</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;background:#fee2e2;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px">❌</div>
    </div>
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;text-align:center">Votre réservation a été annulée</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;text-align:center">Bonjour ${reservation.customer.name}, votre course a été annulée. Nous sommes désolés pour la gêne occasionnée.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:24px">
      <tr><td style="padding:16px">
        <div style="font-size:13px;color:#64748b;margin-bottom:4px">Réservation</div>
        <div style="font-size:15px;color:#1e293b;font-weight:600;margin-bottom:12px">N° ${reservation.reservationId}</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:4px">Trajet prévu</div>
        <div style="font-size:15px;color:#1e293b;font-weight:600;margin-bottom:12px">${fromAddr.split(',')[0]} → ${toAddr.split(',')[0]}</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:4px">Date initialement prévue</div>
        <div style="font-size:15px;color:#1e293b;font-weight:600">${datePickup} à ${heurePickup}</div>
      </td></tr>
    </table>
    <p style="text-align:center;font-size:14px;color:#1e293b;margin:0 0 16px;font-weight:600">Besoin d'une nouvelle course ?</p>
    <p style="text-align:center;font-size:13px;color:#64748b;margin:0">
      Appelez-nous au <a href="tel:+33554543466" style="color:#1e293b;font-weight:600;text-decoration:none">+33 5 54 54 34 66</a><br>
      ou réservez en ligne sur <a href="https://taxibordeauxsolution.fr" style="color:#1e293b;font-weight:600;text-decoration:none">taxibordeauxsolution.fr</a>
    </p>
  </td></tr>
  <tr><td style="padding:12px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#94a3b8">
    Taxi Bordeaux Solution · contact@taxibordeauxsolution.fr
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

        const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
        const emailRes = await resend.emails.send({
          from: fromEmail,
          to: [reservation.customer.email],
          replyTo: 'contact@taxibordeauxsolution.fr',
          subject: `Annulation de votre réservation N° ${reservation.reservationId} — Taxi Bordeaux Solution`,
          html,
        }).catch(() => null)
        cancelEmailSent = !!(emailRes as any)?.data?.id
      }
    }

    if (status === 'en_route' && reservation.customer.email) {
      const fromAddr = typeof reservation.trip.from === 'string' ? reservation.trip.from : reservation.trip.from?.address || ''
      const toAddr = typeof reservation.trip.to === 'string' ? reservation.trip.to : reservation.trip.to?.address || ''
      const pickupDate = new Date(reservation.pickupDate)
      const heurePickup = pickupDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      const datePickup = pickupDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f5;color:#1e293b">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
  <tr><td style="background:#1e293b;padding:20px 32px;text-align:center">
    <h1 style="margin:0;font-size:18px;color:#ffffff;font-weight:600">Taxi Bordeaux Solution</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;background:#dbeafe;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px">🚖</div>
    </div>
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;text-align:center">Votre chauffeur est en route</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#64748b;text-align:center">Bonjour ${reservation.customer.name}, votre taxi arrive.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:24px">
      <tr><td style="padding:16px">
        <div style="font-size:13px;color:#64748b;margin-bottom:4px">Prise en charge</div>
        <div style="font-size:15px;color:#1e293b;font-weight:600;margin-bottom:12px">${fromAddr.split(',')[0]}</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:4px">Destination</div>
        <div style="font-size:15px;color:#1e293b;font-weight:600;margin-bottom:12px">${toAddr.split(',')[0]}</div>
        <div style="font-size:13px;color:#64748b;margin-bottom:4px">Horaire prévu</div>
        <div style="font-size:15px;color:#1e293b;font-weight:600">${datePickup} à ${heurePickup}</div>
      </td></tr>
    </table>
    <p style="text-align:center;font-size:13px;color:#64748b;margin:0">
      Besoin de nous joindre ?<br>
      <a href="tel:+33554543466" style="color:#1e293b;font-weight:600;text-decoration:none">+33 5 54 54 34 66</a>
    </p>
  </td></tr>
  <tr><td style="padding:12px 32px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#94a3b8">
    Taxi Bordeaux Solution · contact@taxibordeauxsolution.fr
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

      const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@taxibordeauxsolution.fr'
      resend.emails.send({
        from: fromEmail,
        to: [reservation.customer.email],
        replyTo: 'contact@taxibordeauxsolution.fr',
        subject: '🚖 Votre chauffeur est en route — Taxi Bordeaux Solution',
        html,
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      data: reservation,
      emailSent: status === 'en_route' && !!reservation.customer.email,
      cancelEmailSent: status === 'annulee' ? cancelEmailSent : undefined,
      customerPhone: reservation.customer.phone,
      customerEmail: reservation.customer.email || '',
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { ids } = await req.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      return NextResponse.json({ success: false }, { status: 400 })

    const result = await Reservation.deleteMany({ _id: { $in: ids } })
    return NextResponse.json({ success: true, deleted: result.deletedCount })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
