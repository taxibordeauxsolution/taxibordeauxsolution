import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Reservation, Client } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()

    // Toutes les réservations réelles (pas les leads)
    const reservations = await Reservation.find(
      { status: { $ne: 'lead_capture' } },
      { 'customer.name': 1, 'customer.phone': 1, 'customer.email': 1 }
    ).lean()

    let created = 0
    let updated = 0
    let skipped = 0

    // Dédupliquer par téléphone avant traitement
    const seen = new Set<string>()
    for (const r of reservations) {
      const c = r.customer as any
      const phone = c?.phone?.trim()
      const name  = c?.name?.trim()
      const email = c?.email?.trim().toLowerCase() || ''

      if (!phone || !name || seen.has(phone)) { skipped++; continue }
      seen.add(phone)

      // Upsert par téléphone — crée si inexistant, ignore si déjà présent
      const result = await Client.updateOne(
        { telephone: phone },
        {
          $setOnInsert: {
            nom: name,
            telephone: phone,
            email,
            adresse: '',
            notes: '',
          },
        },
        { upsert: true }
      )

      if (result.upsertedCount > 0) {
        created++
      } else {
        // Client existant : compléter l'email s'il manque
        if (email) {
          const upd = await Client.updateOne(
            { telephone: phone, email: { $in: ['', null, undefined] } },
            { $set: { email } }
          )
          if (upd.modifiedCount > 0) updated++
          else skipped++
        } else {
          skipped++
        }
      }
    }

    return NextResponse.json({ success: true, created, updated, skipped, total: reservations.length })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
