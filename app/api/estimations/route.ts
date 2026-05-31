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

    // Dédup : si même trajet (from + to) à <30s, on met à jour au lieu de créer
    const thirtySecAgo = new Date(Date.now() - 30 * 1000)
    const existing = await Estimation.findOne({
      from,
      to,
      createdAt: { $gte: thirtySecAgo },
    }).sort({ createdAt: -1 })

    if (existing) {
      existing.distance = distance
      existing.duration = duration
      existing.price = price
      existing.fourchette = body.fourchette || null
      existing.tariffType = tariffType
      existing.isForfait = body.isForfait || false
      existing.departureDate = body.departureDate || null
      await existing.save()
      return NextResponse.json({ success: true, id: existing._id, deduped: true }, { status: 200 })
    }

    const estimation = await Estimation.create({
      from,
      to,
      distance,
      duration,
      price,
      fourchette: body.fourchette || null,
      tariffType,
      isForfait: body.isForfait || false,
      departureDate: body.departureDate || null,
      utmSource: body.utmSource || null,
      utmMedium: body.utmMedium || null,
      utmCampaign: body.utmCampaign || null,
    })

    return NextResponse.json({ success: true, id: estimation._id }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
