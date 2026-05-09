import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Estimation } from '@/app/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const { from, to, distance, duration, price, tariffType } = body
    if (!from || !to || !distance || !duration || !price || !tariffType) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    await Estimation.create({
      from,
      to,
      distance,
      duration,
      price,
      fourchette: body.fourchette || null,
      tariffType,
      isForfait: body.isForfait || false,
      departureDate: body.departureDate || null,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
