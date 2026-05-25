import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB, Client } from '@/app/lib/mongodb'

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
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const skip = (page - 1) * limit

    const filter: any = {}
    if (search) {
      const regex = { $regex: search, $options: 'i' }
      filter.$or = [
        { nom: regex },
        { telephone: regex },
        { email: regex },
      ]
    }

    const [clients, total] = await Promise.all([
      Client.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Client.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { nom, telephone, email, adresse, notes } = await req.json()
    if (!nom || !telephone)
      return NextResponse.json({ success: false, message: 'Nom et téléphone requis' }, { status: 400 })

    const client = await Client.create({ nom, telephone, email: email || '', adresse: adresse || '', notes: notes || '' })
    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req))
    return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 })

  try {
    await connectDB()
    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ success: false, message: 'ID requis' }, { status: 400 })

    const allowed = ['nom', 'telephone', 'email', 'adresse', 'notes']
    const update: Record<string, any> = {}
    for (const k of allowed) {
      if (updates[k] !== undefined) update[k] = updates[k]
    }

    const client = await Client.findByIdAndUpdate(id, { $set: update }, { new: true })
    if (!client) return NextResponse.json({ success: false, message: 'Client non trouvé' }, { status: 404 })

    return NextResponse.json({ success: true, data: client })
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
      return NextResponse.json({ success: false, message: 'IDs requis' }, { status: 400 })

    const result = await Client.deleteMany({ _id: { $in: ids } })
    return NextResponse.json({ success: true, deleted: result.deletedCount })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
