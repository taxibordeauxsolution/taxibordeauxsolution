import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, Reservation } from '@/app/lib/mongodb'

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

    const filter: any = {}
    if (status && status !== 'all') filter.status = status
    if (from || to) {
      filter.pickupDate = {}
      if (from) filter.pickupDate.$gte = new Date(from)
      if (to) filter.pickupDate.$lte = new Date(to + 'T23:59:59.999Z')
    }

    const reservations = await Reservation.find(filter).sort({ pickupDate: -1 }).limit(500).lean()

    const stats = {
      total: await Reservation.countDocuments(filter),
      en_attente: await Reservation.countDocuments({ ...filter, status: 'en_attente' }),
      confirmee: await Reservation.countDocuments({ ...filter, status: 'confirmee' }),
      terminee: await Reservation.countDocuments({ ...filter, status: 'terminee' }),
      annulee: await Reservation.countDocuments({ ...filter, status: 'annulee' }),
    }

    return NextResponse.json({ success: true, data: reservations, stats })
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

    const reservation = await Reservation.findByIdAndUpdate(id, { status }, { new: true })
    if (!reservation) return NextResponse.json({ success: false, message: 'Non trouvée' }, { status: 404 })

    return NextResponse.json({ success: true, data: reservation })
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
