import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Counter, Reservation } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  await connectDB()

  const { reservationId } = await req.json().catch(() => ({ reservationId: null }))

  // Si la réservation a déjà un numéro, le retourner directement
  if (reservationId) {
    const resa = await Reservation.findById(reservationId)
    if (resa?.invoiceNumber) {
      return NextResponse.json({ success: true, invoiceNumber: resa.invoiceNumber })
    }
  }

  // Incrément atomique avec garantie de minimum 1100 en une seule opération
  // Utilise un pipeline d'agrégation (MongoDB 4.2+) pour être vraiment atomique
  const counter = await Counter.findByIdAndUpdate(
    'invoice',
    [{
      $set: {
        seq: {
          $add: [
            { $max: [{ $ifNull: ['$seq', 1099] }, 1099] },
            1,
          ],
        },
      },
    }],
    { new: true, upsert: true }
  )

  const num = counter.seq

  if (reservationId) {
    await Reservation.findByIdAndUpdate(reservationId, { $set: { invoiceNumber: num } })
  }

  return NextResponse.json({ success: true, invoiceNumber: num })
}
