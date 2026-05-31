import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Counter, Reservation } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()

    const { reservationId } = await req.json().catch(() => ({ reservationId: null }))

    // Si la réservation a déjà un numéro, le retourner directement
    if (reservationId) {
      const resa = await Reservation.findById(reservationId).catch(() => null)
      if (resa?.invoiceNumber) {
        return NextResponse.json({ success: true, invoiceNumber: resa.invoiceNumber })
      }
    }

    // Initialiser le compteur à 1099 si première utilisation (create est no-op si déjà présent)
    await Counter.create({ _id: 'invoice', seq: 1099 }).catch(() => {})

    // Incrément atomique
    const counter = await Counter.findByIdAndUpdate(
      'invoice',
      { $inc: { seq: 1 } },
      { new: true }
    )

    if (!counter) {
      return NextResponse.json({ success: false, message: 'Erreur compteur facture' }, { status: 500 })
    }

    const num = counter.seq

    if (reservationId) {
      await Reservation.findByIdAndUpdate(reservationId, { $set: { invoiceNumber: num } }).catch(() => {})
    }

    return NextResponse.json({ success: true, invoiceNumber: num })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
