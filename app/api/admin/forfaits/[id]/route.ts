import { NextRequest, NextResponse } from 'next/server'
import { connectDB, Forfait } from '@/app/lib/mongodb'
import { verifyAdmin } from '@/app/lib/auth'

const ALLOWED = ['nom', 'pointA', 'pointB', 'prixJour', 'prixNuit', 'actif']

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const { id } = await params
  const body = await req.json()

  const update: Record<string, any> = {}
  for (const k of ALLOWED) {
    if (body[k] !== undefined) update[k] = body[k]
  }

  if ((update.prixJour !== undefined && (typeof update.prixJour !== 'number' || update.prixJour < 0)) ||
      (update.prixNuit !== undefined && (typeof update.prixNuit !== 'number' || update.prixNuit < 0))) {
    return NextResponse.json({ success: false, message: 'Prix invalides' }, { status: 400 })
  }

  const forfait = await Forfait.findByIdAndUpdate(id, update, { new: true })
  if (!forfait) return NextResponse.json({ success: false, message: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ success: true, data: forfait })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(req)) return NextResponse.json({ success: false }, { status: 401 })
  await connectDB()
  const { id } = await params
  await Forfait.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
