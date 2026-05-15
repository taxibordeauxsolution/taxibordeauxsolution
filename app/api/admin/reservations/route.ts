import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'
import { connectDB, Reservation } from '@/app/lib/mongodb'

const resend = new Resend(process.env.RESEND_API_KEY)

const JWT_SECRET = process.env.JWT_SECRET || 'taxi_bordeaux_jwt_secret_2025_very_secure_key_minimum_64_chars_long'

function verifyAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return false
  try {
    const p = jwt.verify(token, JWT_SECRET) as any
    return p.role === 'admin'
  } catch { return false }
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 500)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const skip = (page - 1) * limit

    const filter: any = {}
    if (status && status !== 'all') filter.status = status
    if (from || to) {
      filter.pickupDate = {}
      if (from) filter.pickupDate.$gte = new Date(from)
      if (to) filter.pickupDate.$lte = new Date(to + 'T23:59:59.999Z')
    }

    const baseFilter: any = {}
    if (from || to) {
      baseFilter.pickupDate = filter.pickupDate
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(filter).sort({ pickupDate: -1 }).skip(skip).limit(limit).lean(),
      Reservation.countDocuments(filter),
    ])

    const stats = {
      total: await Reservation.countDocuments(baseFilter),
      en_attente: await Reservation.countDocuments({ ...baseFilter, status: 'en_attente' }),
      confirmee: await Reservation.countDocuments({ ...baseFilter, status: 'confirmee' }),
      en_route: await Reservation.countDocuments({ ...baseFilter, status: 'en_route' }),
      terminee: await Reservation.countDocuments({ ...baseFilter, status: 'terminee' }),
      annulee: await Reservation.countDocuments({ ...baseFilter, status: 'annulee' }),
    }

    return NextResponse.json({ success: true, data: reservations, stats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ success: false }, { status: 400 })

    const update: any = { status }
    if (status === 'en_route') update.enRouteAt = new Date()

    const reservation = await Reservation.findByIdAndUpdate(id, update, { new: true })
    if (!reservation) return NextResponse.json({ success: false, message: 'Non trouvée' }, { status: 404 })

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
      <a href="tel:+33667237822" style="color:#1e293b;font-weight:600;text-decoration:none">+33 6 67 23 78 22</a>
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

    return NextResponse.json({ success: true, data: reservation, emailSent: status === 'en_route' && !!reservation.customer.email })
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
