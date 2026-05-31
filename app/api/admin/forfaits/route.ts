import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Forfait } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const forfaits = await Forfait.find().sort({ createdAt: -1 })
  return NextResponse.json({ success: true, data: forfaits })
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const body = await req.json()

  const { nom, pointA, pointB, prixJour, prixNuit, actif } = body
  if (!nom || !pointA || !pointB || prixJour == null || prixNuit == null) {
    return NextResponse.json({ success: false, message: 'Champs requis : nom, pointA, pointB, prixJour, prixNuit' }, { status: 400 })
  }
  if (typeof prixJour !== 'number' || typeof prixNuit !== 'number' || prixJour < 0 || prixNuit < 0) {
    return NextResponse.json({ success: false, message: 'Prix invalides' }, { status: 400 })
  }

  const forfait = await Forfait.create({ nom, pointA, pointB, prixJour, prixNuit, actif: actif ?? true })
  return NextResponse.json({ success: true, data: forfait }, { status: 201 })
}
