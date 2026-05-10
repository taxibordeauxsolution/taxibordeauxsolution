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
    const in90min = new Date(now.getTime() + 90 * 60000)
    const in120min = new Date(now.getTime() + 120 * 60000)

    const reservations = await Reservation.find({
      status: { $in: ['en_attente', 'confirmee'] },
      rappelEnvoye: false,
      pickupDate: { $gte: in90min, $lte: in120min },
    })

    let sent = 0
    for (const r of reservations) {
      const pickup = new Date(r.pickupDate)
      const heurePickup = pickup.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      const datePickup = pickup.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' })

      const prix = r.pricing.fourchette?.de && r.pricing.fourchette?.a
        ? `${r.pricing.fourchette.de.toFixed(2)}€ à ${r.pricing.fourchette.a.toFixed(2)}€`
        : `${r.pricing.totalPrice.toFixed(2)}€`

      const text = [
        `⏰ RAPPEL — Course dans ~2h`,
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

      const res = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text })
      })

      if (res.ok) {
        await Reservation.findByIdAndUpdate(r._id, { rappelEnvoye: true })
        sent++
      }
    }

    return NextResponse.json({ success: true, checked: reservations.length, sent })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
