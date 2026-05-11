import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, Counter, Reservation } from '@/app/lib/mongodb'

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

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  await connectDB()

  const { reservationId } = await req.json().catch(() => ({ reservationId: null }))

  if (reservationId) {
    const resa = await Reservation.findById(reservationId)
    if (resa?.invoiceNumber) {
      return NextResponse.json({ success: true, invoiceNumber: resa.invoiceNumber })
    }
  }

  const counter = await Counter.findByIdAndUpdate(
    'invoice',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )

  let num = counter.seq
  if (num < 1100) {
    await Counter.findByIdAndUpdate('invoice', { $set: { seq: 1100 } })
    num = 1100
  }

  if (reservationId) {
    await Reservation.findByIdAndUpdate(reservationId, { $set: { invoiceNumber: num } })
  }

  return NextResponse.json({ success: true, invoiceNumber: num })
}
