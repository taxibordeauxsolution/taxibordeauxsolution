import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramToken || !telegramChatId) {
    return NextResponse.json({ error: 'Telegram non configuré' }, { status: 500 });
  }

  try {
    const data = await request.json();
    const { type, payload } = data;

    let text = '';

    if (type === 'reservation') {
      const p = payload;
      const prix = p.pricing?.fourchette
        ? `${p.pricing.fourchette.de?.toFixed(2)}€ à ${p.pricing.fourchette.a?.toFixed(2)}€`
        : `${p.pricing?.totalPrice?.toFixed(2)}€`;
      text = `🚖 Nouvelle réservation N°${p.reservationId}\n\n👤 ${p.customer?.name}\n📞 ${p.customer?.phone}${p.customer?.email ? `\n📧 ${p.customer.email}` : '\n⚠️ Pas d\'email — penser à envoyer la confirmation par SMS'}\n\n📍 ${p.trip?.from?.address}\n➡️ ${p.trip?.to?.address}\n📏 ${p.trip?.distance?.toFixed(1)} km\n\n📅 ${p.estimatedPickupTime}\n👥 ${p.bookingDetails?.passengers} passager(s)\n🧳 ${p.bookingDetails?.luggage} bagage(s)\n\n💰 ${prix}`;
    } else if (type === 'contact') {
      const p = payload;
      text = `📩 Nouveau message de contact\n\n👤 ${p.firstName} ${p.lastName}\n📞 ${p.phone}${p.email ? `\n📧 ${p.email}` : ''}\n\n💬 ${p.message}`;
    } else {
      return NextResponse.json({ error: 'Type inconnu' }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramChatId, text })
    });

    const result = await res.json();
    if (!result.ok) {
      console.error('Telegram error:', result);
    }
    return NextResponse.json({ success: result.ok, telegramError: result.ok ? null : result.description });
  } catch (e: any) {
    console.error('Telegram fetch error:', e?.message || e);
    return NextResponse.json({ error: 'Erreur envoi Telegram', message: e?.message }, { status: 500 });
  }
}
