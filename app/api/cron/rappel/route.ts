import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Reservation } from '@/app/lib/mongodb'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID
  if (!telegramToken || !telegramChatId) {
    return NextResponse.json({ error: 'Telegram non configuré' }, { status: 500 })
  }

  try {
    await connectDB()
    const now = new Date()
    let sent = 0

    // Rappel 24h avant
    const in23h = new Date(now.getTime() + 23 * 3600000)
    const in24h30 = new Date(now.getTime() + 24.5 * 3600000)

    const rappels24h = await Reservation.find({
      status: { $in: ['en_attente', 'confirmee'] },
      rappel24h: false,
      pickupDate: { $gte: in23h, $lte: in24h30 },
    })

    for (const r of rappels24h) {
      const ok = await sendRappel(r, '24h', telegramToken, telegramChatId)
      if (ok) {
        await Reservation.findByIdAndUpdate(r._id, { rappel24h: true })
        sent++
      }
    }

    // Rappel 1h avant
    const in45min = new Date(now.getTime() + 45 * 60000)
    const in75min = new Date(now.getTime() + 75 * 60000)

    const rappels1h = await Reservation.find({
      status: { $in: ['en_attente', 'confirmee'] },
      rappel1h: false,
      pickupDate: { $gte: in45min, $lte: in75min },
    })

    for (const r of rappels1h) {
      const ok = await sendRappel(r, '1h', telegramToken, telegramChatId)
      if (ok) {
        await Reservation.findByIdAndUpdate(r._id, { rappel1h: true })
        sent++
      }
    }

    return NextResponse.json({ success: true, sent })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function sendRappel(r: any, delai: string, token: string, chatId: string) {
  const pickup = new Date(r.pickupDate)
  const heurePickup = pickup.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
  const datePickup = pickup.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' })

  const prix = r.pricing.fourchette?.de && r.pricing.fourchette?.a
    ? `${r.pricing.fourchette.de.toFixed(2)}€ à ${r.pricing.fourchette.a.toFixed(2)}€`
    : `${r.pricing.totalPrice.toFixed(2)}€`

  const emoji = delai === '24h' ? '📅' : '🔔'
  const text = [
    `${emoji} RAPPEL — Course dans ${delai}`,
    '',
    `📋 ${r.reservationId}`,
    `👤 ${r.customer.name}`,
    `📞 ${r.customer.phone}`,
    '',
    `🕐 ${datePickup} à ${heurePickup}`,
    `📍 ${r.trip.from}`,
    `➡️ ${r.trip.to}`,
    `📏 ${r.trip.distance?.toFixed(1)} km`,
    `💰 ${prix}`,
    r.notes ? `📝 ${r.notes}` : '',
  ].filter(Boolean).join('\n')

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  })

  return res.ok
}
